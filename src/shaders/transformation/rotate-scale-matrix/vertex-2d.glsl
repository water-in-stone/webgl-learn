attribute vec2 a_position;

uniform vec2 u_resolution;
uniform mat3 u_matrix;

void main() {
  //! 需要注意的是，因为 u_matrix 是1个 3x3 的矩阵，所以一定是 u_matrix * vec3，这个顺序不能变，只有这样才能得到 vec3
  // vec2 handledPostion = (u_matrix * vec3(a_position, 1)).xy;
  // // 使用JS侧计算好之后的矩阵做相乘

  // vec2 zeroToOne = (handledPostion) / u_resolution;

  //  // convert from 0->1 to 0->2
  // vec2 zeroToTwo = zeroToOne * 2.0;

  //  // convert from 0->2 to -1->+1 (clipspace)
  // vec2 clipSpace = zeroToTwo - 1.0;

  // gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  //* 此时全部的变换操作在JS里完成 */
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}