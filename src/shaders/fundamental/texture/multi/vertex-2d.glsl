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