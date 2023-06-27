
import vertexShaderSource from "../shaders/fundamental/texture/simple/vertet-2d.glsl";
import fragmentShaderSource from "../shaders/fundamental/texture/simple/fragment-2d.glsl";

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
        var image = new Image();
        image.src = "http://localhost:8080/leaves.jpg";  // MUST BE SAME DOMAIN!!!
        image.onload = () => {
            this.render(image);
        };
    }

    render(image) {
        // Get A WebGL context
        /** @type {HTMLCanvasElement} */
        var canvas: any = document.querySelector("#c");
        var gl: WebGLRenderingContext = canvas.getContext("webgl");
        if (!gl) {
            return;
        }
        var maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        console.log(`此电脑里最大的纹理单元个数为：${maxTextureUnits}`);


        // setup GLSL program
        var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, "a_position");
        var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

        // Create a buffer to put three 2d clip space points in
        var positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Set a rectangle the same size as the image.
        this.setRectangle(gl, 0, 0, image.width, image.height);

        // provide texture coordinates for the rectangle.
        var texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
        ]), gl.STATIC_DRAW);

        // Create a texture.
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        //! 因为我们这里只创建了1个纹理，所以是默认绑定到纹理单元0上的。
        //! 每个纹理单元都可以绑定一个纹理，然后就可以在着色器中通过sampler2D类型的uniform变量来访问这个纹理。
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // lookup uniforms
        var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset);

        // Turn on the texcoord attribute
        gl.enableVertexAttribArray(texcoordLocation);

        // bind the texcoord buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

        // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            texcoordLocation, size, type, normalize, stride, offset);

        // set the resolution
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

        // set the size of the image
        gl.uniform2f(textureSizeLocation, image.width, image.height);

        // Draw the rectangle.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
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
