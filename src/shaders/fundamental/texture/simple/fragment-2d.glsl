precision mediump float;

// our texture
// uniform sampler2D u_image;
uniform sampler2D u_image;
uniform vec2 u_textureSize;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
  //*  计算1像素对应的纹理坐标 */
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

  //* 对左中右像素求均值，这里的 `v_texCoord + vec2(onePixel.x, 0.0)` 代表像素点向左移动1个元素（归一化之后的1像素的距离），同时 y 
  //* 方向上保持不变 */
  gl_FragColor = (texture2D(u_image, v_texCoord) +
    texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0)) +
    texture2D(u_image, v_texCoord + vec2(-onePixel.x, 0.0))) / 3.0;
}