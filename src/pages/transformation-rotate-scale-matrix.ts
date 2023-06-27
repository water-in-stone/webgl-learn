
import vertexShaderSource from "../shaders/transformation/rotate-scale-matrix/vertex-2d.glsl";
import fragmentShaderSource from "../shaders/transformation/rotate-scale-matrix/fragment-2d.glsl";

//! 使用矩阵来对图像进行平移、缩放和旋转
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

    m3 = {
        //! 这个矩阵其实代表了顶点着色器里的下面几个操作
        //* 从像素坐标转换到 0.0 到 1.0
        //* vec2 zeroToOne = position / u_resolution;
        //*
        //* 再把 0->1 转换 0->2
        //* vec2 zeroToTwo = zeroToOne * 2.0;
        //*
        //* 把 0->2 转换到 -1->+1 (裁剪空间)
        //* vec2 clipSpace = zeroToTwo - 1.0;
        //*
        //* gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        projection: function (width, height) {
            // Note: This matrix flips the Y axis so that 0 is at the top.
            return [
                2 / width, 0, 0,
                0, -2 / height, 0,
                -1, 1, 1
            ];
        },

        identity: function () {
            return [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1,
            ];
        },

        translation: function (tx, ty) {
            return [
                1, 0, 0,
                0, 1, 0,
                tx, ty, 1,
            ];
        },

        rotation: function (angleInRadians) {
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            return [
                c, -s, 0,
                s, c, 0,
                0, 0, 1,
            ];
        },

        scaling: function (sx, sy) {
            return [
                sx, 0, 0,
                0, sy, 0,
                0, 0, 1,
            ];
        },

        multiply: function (a, b) {
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

        translate: function (m, tx, ty) {
            return this.multiply(m, this.translation(tx, ty));
        },

        rotate: function (m, angleInRadians) {
            return this.multiply(m, this.rotation(angleInRadians));
        },

        scale: function (m, sx, sy) {
            return this.multiply(m, this.scaling(sx, sy));
        },
    };

    constructor() {
        this.main();
    }


    main() {
        this.render();
        // window.requestAnimationFrame(this.step);
    }

    //! 使用 requestAnimationFrame 在 spector.js里进行调试
    step = () => {
        this.render();
        window.requestAnimationFrame(this.step);
    }

    render() {
        // Get A WebGL context
        /** @type {HTMLCanvasElement} */
        var canvas: any = document.querySelector("#c");
        var gl: WebGLRenderingContext = canvas.getContext("webgl");
        if (!gl) {
            return;
        }

        var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, "a_position");

        // lookup uniforms
        var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        var colorLocation = gl.getUniformLocation(program, "u_color");
        const matrixLocation = gl.getUniformLocation(program, "u_matrix");

        // Create a buffer to put positions in
        var positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Setup a rectangle
        setGeometry(gl)

        var translation = [100, 150];
        var angleInRadians = 0;
        const scale = [1, 1];
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
            var size = 2;          // 2 components per iteration，说明每次要取2个值
            var type = gl.FLOAT;   // the data is 32bit floats
            var normalize = false; // don't normalize the data
            var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                positionLocation, size, type, normalize, stride, offset);

            // set the resolution
            gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

            // set the color
            gl.uniform4fv(colorLocation, color);

            //! canvas.clientWidth 和 canvas.clientHeight返回的是画布在浏览器中实际显示的大小，而canvas.width和canvas.height不是这样
            var matrix = this.m3.projection((gl.canvas as HTMLCanvasElement).clientWidth, (gl.canvas as HTMLCanvasElement).clientHeight);
            matrix = this.m3.translate(matrix, translation[0], translation[1]);
            matrix = this.m3.rotate(matrix, angleInRadians);
            //! make a matrix that will move the origin of the 'F' to its center. 这里做拆解，你绕着左上角旋转后再向中心移动
            //! 和先移动，再绕中心旋转是一样的，这里移动 (-50, -75) 就是为了绕中心旋转
            matrix = this.m3.translate(matrix, -50, -75);
            matrix = this.m3.scale(matrix, scale[0], scale[1]);

            // Set the matrix.
            gl.uniformMatrix3fv(matrixLocation, false, matrix);

            // Draw the rectangle.
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 18;
            gl.drawArrays(primitiveType, offset, count);
        }

        drawScene();

        // Setup a ui.
        webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
        webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
        webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
        webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
        webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });

        function updateAngle(event, ui) {
            //! 计算一下弧度，sin(π/2) 的值为1
            var angleInDegrees = 360 - ui.value;
            angleInRadians = angleInDegrees * Math.PI / 180;
            drawScene();
        }

        function updateScale(index) {
            return function (event, ui) {
                scale[index] = ui.value;
                drawScene();
            };
        }

        function updatePosition(index) {
            return function (event, ui) {
                translation[index] = ui.value;
                drawScene();
            };
        }
        // 缓冲存储构成 'F' 的值
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
}


new App();
