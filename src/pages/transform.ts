import vertexShaderSource from "../shaders/transformVertex.glsl";
import fragmentShaderSource from "../shaders/transformFragment.glsl";

const transformMatrix = {
    multiply: (a: number[], b: number[]) => {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];

        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },
    translation: (tx: number, ty: number) => {
        return [1, 0, 0, 0, 1, 0, tx, ty, 1];
    },

    rotation: (angleInRadians: number) => {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);
        return [c, -s, 0, s, c, 0, 0, 0, 1];
    },

    scaling: (sx: number, sy: number) => {
        return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
    },
};

export default class App {
    gl: WebGLRenderingContext;
    program: WebGLProgram;

    positionBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;

    positionLocation: number;

    colorLocation: WebGLUniformLocation;
    reslutionLocation: WebGLUniformLocation;
    matrixLocation: WebGLUniformLocation;

    rectangleWidth = 100;
    rectangleHeight = 30;

    translation = [10, 100];
    rotation = 20;
    scaling = [2, 1];

    color = [Math.random(), Math.random(), Math.random(), 1];

    get rotations() {
        const angleInRadians = (this.rotation * Math.PI) / 180;
        return transformMatrix.rotation(angleInRadians);
    }

    constructor() {
        // 1. setup program
        this.setupProgram();

        // 2. setup position
        this.setupPosition();

        // 4. setup color
        this.setupColor();

        // 5. setup uniforms
        this.setupUniforms();

        // 6. draw
        this.draw();
    }

    setupPosition() {
        const gl = this.gl;
        this.positionLocation = this.gl.getAttribLocation(
            this.program,
            "a_position"
        );
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        const x1 = 0;
        const x2 = 0 + this.rectangleWidth;
        const y1 = 0;
        const y2 = 0 + this.rectangleHeight;
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
            gl.STATIC_DRAW
        );
    }

    setupColor() {
        this.colorLocation = this.gl.getUniformLocation(
            this.program,
            "u_color"
        );
    }

    setupProgram() {
        const $canvas = document.querySelector("canvas") as HTMLCanvasElement;

        this.gl = $canvas.getContext("webgl");

        if (!this.gl) {
            console.error("WebGL not supported");
            return;
        }

        // setup GLSL program
        this.program = webglUtils.createProgramFromSources(this.gl, [
            vertexShaderSource,
            fragmentShaderSource,
        ]);
    }

    setupUniforms() {
        this.reslutionLocation = this.gl.getUniformLocation(
            this.program,
            "u_resolution"
        );

        this.matrixLocation = this.gl.getUniformLocation(
            this.program,
            "u_matrix"
        );
    }

    draw() {
        const gl = this.gl;
        webglUtils.resizeCanvasToDisplaySize(gl);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);

        // Turn on the position attribute
        gl.enableVertexAttribArray(this.positionLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        // Tell the position attribute how to get data out of positionbuffer
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        // set the resolution
        gl.uniform2f(this.reslutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform4fv(this.colorLocation, this.color);

        // Compute the matrices
        const translationMatrix = transformMatrix.translation(
            this.translation[0],
            this.translation[1]
        );
        const rotationMatrix = this.rotations;
        const scalingMatrix = transformMatrix.scaling(
            this.scaling[0],
            this.scaling[1]
        );

        // Multiply the matrices.
        const matrix = transformMatrix.multiply(
            translationMatrix,
            rotationMatrix
        );
        const matrix2 = transformMatrix.multiply(matrix, scalingMatrix);

        // Set the matrix.
        console.log(matrix2);
        gl.uniformMatrix3fv(this.matrixLocation, false, matrix2);

        // Draw the rectangle.
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}
