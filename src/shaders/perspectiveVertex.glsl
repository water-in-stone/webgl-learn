attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;
uniform float u_fudgeFactor;

varying vec4 v_color;

void main() {
  // Multiply the position by the matrix.
    vec4 position = u_matrix * a_position;

  // Adjust the z to divide by
    float zToDivideBy = 1.0 + position.z * u_fudgeFactor;

  // Divide x and y by z.
    gl_Position = vec4(position.xyz, zToDivideBy);

  // Pass the color to the fragment shader.
    v_color = a_color;
}
