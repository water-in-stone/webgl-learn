// an attribute will receive data from a buffer
attribute vec4 a_position;
uniform vec2 u_resolution;

    // all shaders have a main function
void main() {
    // 从像素坐标转换到 0.0 到 1.0，即 a_position 是个像素坐标，需要转换到裁剪空间坐标
    vec2 zeroToOne = a_position.xy / u_resolution;
    // 再把 0->1 转换 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // 把 0->2 转换到 -1->+1 (裁剪空间)
    vec2 clipSpace = zeroToTwo - 1.0;

    // 会显示在左下角，因为 WebGL 认为左下角是 0, 0
    // gl_Position = vec4(clipSpace, 0, 1);

    // WebGL认为左下角是 (0，0)。 想要像传统二维API那样起点在左上角，我们只需翻转y轴即可，
    // clipSpace * vec2(1, -1) 可以认为就是简单的 (x * 1, y * -1)
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}