import vertexShaderSource from "../shaders/perspectiveVertex.glsl";
import fragmentShaderSource from "../shaders/perspectiveFragment.glsl";
import { degToRad } from "../utils";
import { projection, translation, xRotation, yRotation, zRotation, scaling, multiply } from '../transform';

class Perspective {
    gl: WebGLRenderingContext;
    program: WebGLProgram;

    positionAttributeLocation: number;
    colorAttributeLocation: number;

    positionBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;

    matrixLocation: WebGLUniformLocation;
    fudgeFactorLocation: WebGLUniformLocation;

    translation = [0, 0, 0];
    rotationDegree = [0, 0, 0];
    scale = [1, 1, 1];
    fudgeFactor = 1;

    get rotation() {
        return this.rotationDegree.map(degToRad);
    }

    constructor() {
        this.setupProgram();
        this.setupGeometry();
        this.setupColor();
        this.setupUniforms();
        this.drawScene();
    }

    setupProgram() {
        const canvas = document.querySelector("canvas") as HTMLCanvasElement;
        this.gl = canvas.getContext("webgl") as WebGLRenderingContext;

        if (!this.gl) {
            throw new Error("WebGL not supported");
        }

        this.program = webglUtils.createProgramFromSources(this.gl, [
            vertexShaderSource,
            fragmentShaderSource,
        ]);
    }

    setupGeometry() {
        const gl = this.gl;
        this.positionAttributeLocation = gl.getAttribLocation(
            this.program,
            "a_position"
        );
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                // left column front
                0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0,

                // top rung front
                30, 0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0,
                0,

                // middle rung front
                30, 60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60,
                0,

                // left column back
                0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150,
                30,

                // top rung back
                30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100,
                30, 30,

                // middle rung back
                30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67,
                90, 30,

                // top
                0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

                // top rung right
                100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100,
                0, 30,

                // under top rung
                30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100,
                30, 0,

                // between top rung and middle
                30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60,
                30,

                // top of middle rung
                30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60,
                30,

                // right of middle rung
                67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67, 90,
                30,

                // bottom of middle rung.
                30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67,
                90, 0,

                // right of bottom
                30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150, 0, 30,
                150, 30,

                // bottom
                0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30,
                150, 0,

                // left side
                0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0,
            ]),
            gl.STATIC_DRAW
        );
    }

    setupColor() {
        const gl = this.gl;
        this.colorAttributeLocation = gl.getAttribLocation(
            this.program,
            "a_color"
        );
        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Uint8Array([
                // left column front
                200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70,
                120, 200, 70, 120,

                // top rung front
                200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70,
                120, 200, 70, 120,

                // middle rung front
                200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70,
                120, 200, 70, 120,

                // left column back
                80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,
                80, 70, 200,

                // top rung back
                80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,
                80, 70, 200,

                // middle rung back
                80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,
                80, 70, 200,

                // top
                70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200,
                210, 70, 200, 210,

                // top rung right
                200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200,
                200, 70, 200, 200, 70,

                // under top rung
                210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210,
                100, 70, 210, 100, 70,

                // between top rung and middle
                210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210,
                160, 70, 210, 160, 70,

                // top of middle rung
                70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180,
                210, 70, 180, 210,

                // right of middle rung
                100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70,
                210, 100, 70, 210,

                // bottom of middle rung.
                76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210,
                100, 76, 210, 100,

                // right of bottom
                140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140,
                210, 80, 140, 210, 80,

                // bottom
                90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130,
                110, 90, 130, 110,

                // left side
                160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220, 160,
                160, 220, 160, 160, 220,
            ]),
            gl.STATIC_DRAW
        );
    }

    setupUniforms() {
        const gl = this.gl;
        this.matrixLocation = gl.getUniformLocation(this.program, "u_matrix");
        this.fudgeFactorLocation = gl.getUniformLocation(this.program, 'u_fudgeFactor');
    }

    drawScene() {
        const gl = this.gl;
        webglUtils.resizeCanvasToDisplaySize(this.gl);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.CULL_FACE);

        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(this.program);

        // render the F positions
        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        // render the F colors
        gl.enableVertexAttribArray(this.colorAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(this.colorAttributeLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

        // Compute the matrices
        const matrix1 = projection(gl.canvas.width, gl.canvas.height, 400)
        const matrix2 = xRotation(this.rotation[0]);
        const matrix3 = yRotation(this.rotation[1]);
        const matrix4 = zRotation(this.rotation[2]);
        const matrix5 = scaling(this.scale[0], this.scale[1], this.scale[2]);
        const matrix6 = translation(this.translation[0], this.translation[1], this.translation[2]);

        // Multiply the matrices.
        const matrix = multiply(matrix1, matrix2);

        // Set the matrix.
        gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Set the fudgeFactor
        gl.uniform1f(this.fudgeFactorLocation, this.fudgeFactor);

        // Drwa the geometry.
        gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
    }
}

new Perspective();
