attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_rotation;
uniform vec2 u_scale;

void main() {
  vec2 scaledPostion = a_position * u_scale;
  // 计算1个旋转矩阵
  vec2 rotatedPosition = vec2(scaledPostion.x * u_rotation.y + scaledPostion.y * u_rotation.x, scaledPostion.y * u_rotation.y - scaledPostion.x * u_rotation.x);

  vec2 zeroToOne = (rotatedPosition + u_translation) / u_resolution;

   // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}