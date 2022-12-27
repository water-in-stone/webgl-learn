import vertexShaderSource from "../shaders/vertex.glsl";
import fragmentShaderSource from "../shaders/fragment.glsl";

export default class App {
    gl: WebGLRenderingContext;
    program: WebGLProgram;

    positionBuffer: WebGLBuffer;
    texcoordBuffer: WebGLBuffer;

    positionLocation: number;
    textureCoordLocation: number;
    textureLocation: WebGLUniformLocation;
    reslutionLocation: WebGLUniformLocation;
    textureSizeLocation: WebGLUniformLocation;
    kernelLocation: WebGLUniformLocation;
    kernelWeightLocation: WebGLUniformLocation;

    kernel = [
      0,-1, 0,
      -1, 5,-1,
      0,-1, 0
    ];

    get kernelWeight(): number {
        const weight = this.kernel.reduce((prev, curr) => prev + curr);
        return weight <= 0 ? 1 : weight;
    }

    constructor(public image: HTMLImageElement) {
        // 1. setup program
        this.setupProgram();

        // 2. setup position
        this.setupPosition();

        // 3. setup textureCoord
        this.setupTextureCoord();

        // 4. setup texture
        this.setupTexture();

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
        const x2 = 0 + this.image.width;
        const y1 = 0;
        const y2 = 0 + this.image.height;
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
            gl.STATIC_DRAW
        );
    }

    setupTextureCoord() {
        // provide texture coordinates for the rectangle.
        const gl = this.gl;
        this.textureCoordLocation = gl.getAttribLocation(
            this.program,
            "a_texCoord"
        );
        this.texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
            ]),
            gl.STATIC_DRAW
        );
    }

    setupTexture() {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set up texture so we can render any size image and so we are
        // working with pixels.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            this.image
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
        this.textureSizeLocation = this.gl.getUniformLocation(
            this.program,
            "u_textureSize"
        );
        this.kernelLocation = this.gl.getUniformLocation(
            this.program,
            "u_kernel[0]"
        );
        this.kernelWeightLocation = this.gl.getUniformLocation(
            this.program,
            "u_kernelWeight"
        );
    }

    createAndSetupTexture() {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set up texture so we can render any size image and so we are
        // working with pixels.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
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

        // Turn on the texcoord attribute
        gl.enableVertexAttribArray(this.textureCoordLocation);

        // Bind the texcoord buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);

        // Tell the texcoord attribute how to get data out of positionbuffer (ARRAY_BUFFER)
        gl.vertexAttribPointer(
            this.textureCoordLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        // set the resolution
        gl.uniform2f(this.reslutionLocation, gl.canvas.width, gl.canvas.height);

        // set the size of the image
        gl.uniform2f(
            this.textureSizeLocation,
            this.image.width,
            this.image.height
        );

        // set the kernel
        gl.uniform1fv(this.kernelLocation, this.kernel);

        // set the kernel weight
        gl.uniform1f(this.kernelWeightLocation, this.kernelWeight);

        // Draw the rectangle.
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}
