declare module "*.glsl" {
    const value: string;
    export default value;
}

declare namespace webglUtils {
    function createProgramFromSources(
        gl: WebGLRenderingContext,
        shaderSources: string[]
    ): WebGLProgram;
    function createAttribsFromArrays(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
        arrays: any
    ): void;
    function createBufferInfoFromArrays(
        gl: WebGLRenderingContext,
        arrays: any
    ): any;
    function createVAOFromBufferInfo(
        gl: WebGLRenderingContext,
        programInfo: any,
        bufferInfo: any
    ): any;
    function resizeCanvasToDisplaySize(
        canvas: HTMLCanvasElement,
    ): void;
}

declare namespace webglLessonsUI {
    function setupUI(parent, object, uiInfos): Record<string, any>;
    function updateUI(widgets, data): void;
    function setupSlider(selector, options): any;
    function makeSlider(options): any;
    function makeCheckbox(options: any): any;
}

declare namespace m4 {
    function transformPoint(m, v, dst?): any;
    function perspective(fieldOfViewInRadians, aspect, near, far, dst?): any;
    function lookAt(cameraPosition, target, up, dst?): any;
    function inverse(m, dst?): any;
    function multiply(a, b, dst?): any;
    function yRotation(angleInRadians, dst?): any;
    function normalize(v, dst?): any;
    function xRotation(angleInRadians, dst?): any;
    function translate(m, tx, ty, tz, dst?): any;
}
