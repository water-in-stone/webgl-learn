
import vertexShaderSource from "../shaders/fundamental/case2/vertex-2d.glsl";
import fragmentShaderSource from "../shaders/fundamental/case2/fragment-2d.glsl";

// 画1个矩形
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

    constructor() {
        this.main();
    }

    main() {
        // Get A WebGL context
        var canvas = document.querySelector("#c");
        // @ts-ignore
        var gl = canvas.getContext("webgl");
        if (!gl) {
            return;
        }

        // Get the strings for our GLSL shaders

        // create GLSL shaders, upload the GLSL source, compile the shaders

        // Link the two shaders into a program
        var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

        // look up where the vertex data needs to go.
        var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

        // look up uniform locations，设置 u_resolution 为画布的分辨率，着色器将会从 positionBuffer 中获取像素坐标将之转换为对应的裁剪空间坐标。
        var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

        // Create a buffer to put three 2d clip space points in
        var positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        var positions = [
            10, 20,
            80, 20,
            10, 30,
            10, 30,
            80, 20,
            80, 30,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);

        // set the resolution，设置全局分辨率
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // draw
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }
}


new App();