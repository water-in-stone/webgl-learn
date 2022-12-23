import vertexShaderSource from "./shaders/vertex.glsl";
import fragmentShaderSource from "./shaders/fragment.glsl";

async function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
}

async function main() {
    const $canvas = document.querySelector("canvas") as HTMLCanvasElement;

    const gl = $canvas.getContext("webgl");

    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    // setup GLSL program
    const program = webglUtils.createProgramFromSources(gl, [
        vertexShaderSource,
        fragmentShaderSource,
    ]);

    // look up where the vertex data needs to go.
    const poistionAttributeLocation = gl.getAttribLocation(
        program,
        "a_position"
    );

    // look up texture coordinates
    const texcoordAttributeLocation = gl.getAttribLocation(
        program,
        "a_texCoord"
    );
    // create texture buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1]),
        gl.STATIC_DRAW
    );

    // get Image
    const image = await loadImage("http://localhost:8080/leaves.jpg");
    const {
        width: imageWidth,
        height: imageHeight,
    } = image;
    // Create a buffer and put three 2d clip space points in it
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // buffer rectangles data
    const rectangles = [
        0, 0,
        0, imageHeight,
        imageWidth, 0,
        imageWidth, imageHeight,
        0, imageHeight,
        imageWidth, 0
    ];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(rectangles),
        gl.STATIC_DRAW
    );

    // look up color location
    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // set the color
    const colors = [
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // look up uniform locations
    const resolutionUniformLocation = gl.getUniformLocation(
        program,
        "u_resolution"
    );

    webglUtils.resizeCanvasToDisplaySize(gl);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // use the program
    gl.useProgram(program);

    // set the resolution
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // set the detectKernel
    const edgeDetectKernel = [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
    ];

    const kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
    
    gl.uniform1fv(kernelLocation, edgeDetectKernel);

    // set the KernelWeight
    const kernelWeightSum = edgeDetectKernel.reduce(
        (prev, curr) => prev + curr
    );
    const kernelWeight = kernelWeightSum <= 0 ? 1 : kernelWeightSum;

    const kernelWeightLocation = gl.getUniformLocation(
        program,
        "u_kernelWeight"
    );
    gl.uniform1f(kernelWeightLocation, kernelWeight);

    // set the size of the image
    const textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
    gl.uniform2f(textureSizeLocation, imageWidth, imageHeight);

    // enable the color attributes
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
        colorAttributeLocation,
        3,
        gl.UNSIGNED_BYTE,
        true,
        0,
        0
    );

    // enable the texture coordinate attributes
    gl.enableVertexAttribArray(texcoordAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Create a texture.
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //  Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // enable the position attributes
    gl.enableVertexAttribArray(poistionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(poistionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

main();
