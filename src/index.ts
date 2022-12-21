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

    // look up uniform locations
    const resolutionUniformLocation = gl.getUniformLocation(
        program,
        "u_resolution"
    );
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");

    // Create a buffer and put three 2d clip space points in it
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    webglUtils.resizeCanvasToDisplaySize(gl);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // use the program
    gl.useProgram(program);

    gl.enableVertexAttribArray(poistionAttributeLocation);

    gl.vertexAttribPointer(poistionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // set the resolution
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // draw rectangles
    const rectangles = [0, 0, 100, 0, 100, 100, 0, 0];

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(rectangles),
        gl.STATIC_DRAW
    );
    gl.drawArrays(gl.TRIANGLES, 0, 4);
    // console.log("object");
}

main();
