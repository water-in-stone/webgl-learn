precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_textureSize;
uniform float u_kernel[9];
uniform float u_kernelWeight;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

//! 如何理解 `v_texCoord + onePixel * vec2(0, -1)`?
//  在WebGL中，纹理坐标系是二维的，通常用u和v来表示。在这个坐标系中，u对应的是纹理的水平方向，v对应的是纹理的垂直方向。
// u和v的值都在0到1之间，其中（0，0）表示纹理的左下角，（1，1）表示纹理的右上角。
// 在这段代码中，v_texCoord是一个vec2类型的变量，表示当前像素的纹理坐标。
// onePixel是一个vec2类型的变量，表示一个像素在纹理坐标系中的大小。
// vec2(0, -1)是一个二维向量，表示在垂直方向上向下移动一个单位。
// 因为在WebGL的纹理坐标系中，垂直方向上的正方向是向上的，所以向下移动就是v值减小，因此这个向量的v分量是-1。

// onePixel * vec2(0, -1)的结果是一个vec2类型的变量，表示在纹理坐标系中向下移动一个像素的向量。
// v_texCoord + onePixel * vec2(0, -1)的结果是一个vec2类型的变量，表示当前像素的纹理坐标向下移动一个像素的新纹理坐标。
// 所以，`v_texCoord + onePixel * vec2(0, -1)` 这句代码的意思就是“这个新的纹理坐标是当前像素的纹理坐标v_texCoord向下移动一个像素的位置”。
  vec4 colorSum = texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
    texture2D(u_image, v_texCoord + onePixel * vec2(0, -1)) * u_kernel[1] +
    texture2D(u_image, v_texCoord + onePixel * vec2(1, -1)) * u_kernel[2] +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1, 0)) * u_kernel[3] +
    texture2D(u_image, v_texCoord + onePixel * vec2(0, 0)) * u_kernel[4] +
    texture2D(u_image, v_texCoord + onePixel * vec2(1, 0)) * u_kernel[5] +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1, 1)) * u_kernel[6] +
    texture2D(u_image, v_texCoord + onePixel * vec2(0, 1)) * u_kernel[7] +
    texture2D(u_image, v_texCoord + onePixel * vec2(1, 1)) * u_kernel[8];

// 卷积核的权重u_kernelWeight是卷积核中所有元素的和。在进行卷积操作时，我们将图像中的每个像素与卷积核中的对应元素相乘，然后将所有的乘积相加，得到一个新的像素值。这个新的像素值是原像素值的加权平均值，权重就是卷积核中的元素。
// 然而，如果卷积核中的元素之和不为1，那么这个加权平均值可能会大于原像素值的最大可能值（例如，对于8位图像，最大可能值是255）。为了防止这种情况，我们需要将加权平均值除以卷积核的权重，使得新的像素值在有效范围内。

// 如果不除以卷积核的权重，那么新的像素值可能会超出有效范围，导致图像的颜色失真。例如，如果新的像素值超过了255，那么在8位图像中，这个像素值会被截断为255，导致颜色信息的丢失。这种情况在图像处理中通常被称为饱和。
// 所以，除以卷积核的权重是为了保证新的像素值在有效范围内，防止颜色的失真和饱和。
  gl_FragColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}