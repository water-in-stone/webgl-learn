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
        gl: WebGLRenderingContext,
    ): void;
}
