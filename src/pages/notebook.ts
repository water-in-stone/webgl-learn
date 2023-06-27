const fragmentShaderSource = `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
   // convert the rectangle from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

   // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
  v_texCoord = a_texCoord;
}
`;
const vertexShaderSource = `
precision mediump float;

// our textures
uniform sampler2D u_image0;
uniform sampler2D u_image1;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
    vec4 color0 = texture2D(u_image0, v_texCoord);
    vec4 color1 = texture2D(u_image1, v_texCoord);
    gl_FragColor = color0 * color1;
}
`;

var canvas: any = document.querySelector("#c");
var gl: WebGLRenderingContext = canvas.getContext("webgl");

// setup GLSL program
var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
gl.useProgram(program);

// look up where the vertex data needs to go.
var positionLocation = gl.getAttribLocation(program, "a_position");
var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

// Create a buffer to put three 2d clip space points in
var positionBuffer = gl.createBuffer();

// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// Set a rectangle the same size as the image.
const images = [{ width: 300, height: 400 }]
setRectangle(gl, 0, 0, images[0].width, images[0].height);

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

function setRectangle(gl, x, y, width, height) {
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
