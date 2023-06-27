
import vertexShaderSource from "../shaders/transformation/horizontal/vertex-2d.glsl";
import fragmentShaderSource from "../shaders/transformation/horizontal/fragment-2d.glsl";

//! 将每个像素的值设置为与左右像素的均值，进行1个简单的模糊处理
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
        this.render();
    }

    render() {
        // Get A WebGL context
        /** @type {HTMLCanvasElement} */
        var canvas: any = document.querySelector("#c");
        var gl: WebGLRenderingContext = canvas.getContext("webgl");
        if (!gl) {
            return;
        }

        // setup GLSL program
        var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);


        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, "a_position");

        // lookup uniforms
        var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        var colorLocation = gl.getUniformLocation(program, "u_color");
        var translationLocation = gl.getUniformLocation(program, "u_translation");

        // Create a buffer to put positions in
        var positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Setup a rectangle
        setGeometry(gl)

        var translation = [0, 0];
        var color = [Math.random(), Math.random(), Math.random(), 1];

        // Draw a the scene.
        const drawScene = () => {
            webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // Clear the canvas.
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Tell it to use our program (pair of shaders)
            gl.useProgram(program);

            // Turn on the attribute
            gl.enableVertexAttribArray(positionLocation);

            // Bind the position buffer.
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
            var size = 2;          // 2 components per iteration
            var type = gl.FLOAT;   // the data is 32bit floats
            var normalize = false; // don't normalize the data
            var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                positionLocation, size, type, normalize, stride, offset);

            // set the resolution
            gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform2fv(translationLocation, translation);

            // set the color
            gl.uniform4fv(colorLocation, color);

            // Draw the rectangle.
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 18;
            gl.drawArrays(primitiveType, offset, count);
        }

        drawScene();

        // Setup a ui.
        webglLessonsUI.setupSlider("#x", { slide: updatePosition(0), max: gl.canvas.width });
        webglLessonsUI.setupSlider("#y", { slide: updatePosition(1), max: gl.canvas.height });

        function updatePosition(index) {
            return function (event, ui) {
                translation[index] = ui.value;
                drawScene();
            };
        }
        // 在缓冲存储构成 'F' 的值
        function setGeometry(gl) {
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    // 左竖
                    0, 0,
                    30, 0,
                    0, 150,
                    0, 150,
                    30, 0,
                    30, 150,

                    // 上横
                    30, 0,
                    100, 0,
                    30, 30,
                    30, 30,
                    100, 0,
                    100, 30,

                    // 中横
                    30, 60,
                    67, 60,
                    30, 90,
                    30, 90,
                    67, 60,
                    67, 90,
                ]),
                gl.STATIC_DRAW);
        }

    }

    setRectangle(gl, x, y, width, height) {
        var x1 = x;
        var x2 = x + width;
        var y1 = y;
        var y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), gl.STATIC_DRAW);
    }
}


new App();
