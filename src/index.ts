import vertexShaderSource from "./shaders/vertex.glsl";
import fragmentShaderSource from "./shaders/fragment.glsl";

function main() {
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

    // Create a buffer and put three 2d clip space points in it
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // buffer rectangles data
    const rectangles = [
        0, 0, 0,
        100, 100, 0,
        100, 100, 0,
        100, 100, 0
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
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255
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

    // enable the color attributes
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    
    // enable the position attributes
    gl.enableVertexAttribArray(poistionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(poistionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    // draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

main();
