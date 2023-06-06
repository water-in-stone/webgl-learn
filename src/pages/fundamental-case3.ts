
import vertexShaderSource from "../shaders/fundamental/case3/vertex-2d.glsl";
import fragmentShaderSource from "../shaders/fundamental/case3/fragment-2d.glsl";

// 画 50 个矩形
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
        // create GLSL shaders, upload the GLSL source, compile the shaders

        // Link the two shaders into a program
        var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

        // look up where the vertex data needs to go.
        var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

        // look up uniform locations，设置 u_resolution 为画布的分辨率，着色器将会从 positionBuffer 中获取像素坐标将之转换为对应的裁剪空间坐标。
        var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

        // 设置一个全局的颜色变量
        var colorUniformLocation = gl.getUniformLocation(program, "u_color");

        // Create a buffer to put three 2d clip space points in
        var positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        //! 等到后面再真正地去设置 bufferData

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

        //! 开始进行真正的draw
        for (let i = 0; i < 50; i++) {
            // 创建一个随机矩形
            // 并将写入位置缓冲
            // 因为位置缓冲是我们绑定在
            // `ARRAY_BUFFER`绑定点上的最后一个缓冲
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 6;  // 有6个点要绘制
            this.setRectangle(gl, this.randomInt(300), this.randomInt(300), this.randomInt(300), this.randomInt(300));
            // 设置一个随机颜色
            gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

            gl.drawArrays(primitiveType, offset, count);
        }
    }

    // 用参数生成矩形顶点并写进缓冲
    setRectangle(gl, x, y, width, height) {
        const x1 = x
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;
        // 输入2个三角形的位置坐标，总共6个点
        // 注意: gl.bufferData(gl.ARRAY_BUFFER, ...) 将会影响到
        // 当前绑定点`ARRAY_BUFFER`的绑定缓冲
        // 目前我们只有一个缓冲，如果我们有多个缓冲
        // 我们需要先将所需缓冲绑定到`ARRAY_BUFFER`
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), gl.STATIC_DRAW);
    }

    // Returns a random integer from 0 to range - 1.
    randomInt(range) {
        return Math.floor(Math.random() * range);
    }
}


new App();
