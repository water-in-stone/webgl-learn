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

    //* 因为输入的是1个纹理，这里对应的是像素空间，而在像素空间中，左上角是（0, 0) 且Y轴上从上往下的，所以GPU在取位置 */ 
    //* 坐标时，需要对裁剪空间的Y轴做一个翻转，`clipSpace * vec2(1, -1)` */ 
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
    v_texCoord = a_texCoord;
}