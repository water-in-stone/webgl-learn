
import vertexShaderSource from "../shaders/transformation/3d-camera-light-pro/vertex-2d.glsl";
import fragmentShaderSource from "../shaders/transformation/3d-camera-light-pro/fragment-2d.glsl";

function normalize(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
}

function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]];
}


function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}


function setNormals(gl) {
    var normals = new Float32Array([
        // left column front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // top rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // middle rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // left column back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // middle rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // top rung right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // under top rung
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // between top rung and middle
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // top of middle rung
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // right of middle rung
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom of middle rung.
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // right of bottom
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // left side
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0]);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}


//! 显示光照，但是光照是一直打向1个方向的
export default class App {
    gl: WebGLRenderingContext;
    program: WebGLProgram;

    positionBuffer: WebGLBuffer;
    texcoordBuffer: WebGLBuffer;

    positionLocation: number;
    textureCoordLocation: number;
    textureLocation: WebGLUniformLocation;
    reslutionLocation: WebGLUniformLocation;
    textureSizeLocation: WebGLUniformLocation;
    kernelLocation: WebGLUniformLocation;
    kernelWeightLocation: WebGLUniformLocation;


    constructor() {
        this.main();
    }


    main() {
        this.render();
        // window.requestAnimationFrame(this.step);
    }

    //! 使用 requestAnimationFrame 来进行调试
    step = () => {
        this.render();
        window.requestAnimationFrame(this.step);
    }

    render() {
        // Get A WebGL context
        /** @type {HTMLCanvasElement} */
        var canvas: any = document.querySelector("#c");
        var gl: WebGLRenderingContext = canvas.getContext("webgl");
        if (!gl) {
            return;
        }

        // setup GLSL program
        var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, "a_position");
        var normalLocation = gl.getAttribLocation(program, "a_normal");

        // lookup uniforms
        var worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
        var worldLocation = gl.getUniformLocation(program, "u_world");
        var colorLocation = gl.getUniformLocation(program, "u_color");
        var reverseLightDirectionLocation =
            gl.getUniformLocation(program, "u_reverseLightDirection");


        // Create a buffer to put positions in
        var positionBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Put geometry data into buffer
        this.setGeometry(gl);

        // Create a buffer to put normals in
        var normalBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        // Put normals data into buffer
        setNormals(gl);

        function radToDeg(r) {
            return r * 180 / Math.PI;
        }

        function degToRad(d) {
            return d * Math.PI / 180;
        }

        var fieldOfViewRadians = degToRad(60);
        var fRotationRadians = 0;

        // Draw the scene.
        const drawScene = () => {
            webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // Clear the canvas AND the depth buffer.
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Turn on culling. By default backfacing triangles
            // will be culled.
            gl.enable(gl.CULL_FACE);

            // Enable the depth buffer
            gl.enable(gl.DEPTH_TEST);

            // Tell it to use our program (pair of shaders)
            gl.useProgram(program);

            // Turn on the position attribute
            gl.enableVertexAttribArray(positionLocation);

            // Bind the position buffer.
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
            var size = 3;          // 3 components per iteration
            var type = gl.FLOAT;   // the data is 32bit floats
            var normalize = false; // don't normalize the data
            var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                positionLocation, size, type, normalize, stride, offset);

            // Turn on the normal attribute
            gl.enableVertexAttribArray(normalLocation);

            // Bind the normal buffer.
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

            // Tell the attribute how to get data out of normalBuffer (ARRAY_BUFFER)
            var size = 3;          // 3 components per iteration
            var type = gl.FLOAT;   // the data is 32bit floating point values
            var normalize = false; // normalize the data (convert from 0-255 to 0-1)
            var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0;         // start at the beginning of the buffer
            gl.vertexAttribPointer(
                normalLocation, size, type, normalize, stride, offset);

            // Compute the projection matrix
            var aspect = (gl.canvas as HTMLCanvasElement).clientWidth / (gl.canvas as HTMLCanvasElement).clientHeight;
            var zNear = 1;
            var zFar = 2000;
            var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

            // Compute the camera's matrix
            var camera = [100, 150, 200];
            var target = [0, 35, 0];
            var up = [0, 1, 0];
            var cameraMatrix = m4.lookAt(camera, target, up);

            // Make a view matrix from the camera matrix.
            var viewMatrix = m4.inverse(cameraMatrix);

            // Compute a view projection matrix
            var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

            // Draw a F at the origin
            var worldMatrix = m4.yRotation(fRotationRadians);

            // Multiply the matrices.
            //! 核心代码，这里需要移动法向量的位置
            var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);

            // Set the matrices
            gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
            gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

            // Set the color to use
            gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green

            // set the light direction.
            gl.uniform3fv(reverseLightDirectionLocation, m4.normalize([0.5, 0.7, 1]));

            // Draw the geometry.
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 16 * 6;
            gl.drawArrays(primitiveType, offset, count);
        }

        drawScene();

        // Setup a ui.
        webglLessonsUI.setupSlider("#fRotation", { value: radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360 });

        function updateRotation(event, ui) {
            fRotationRadians = degToRad(ui.value);
            drawScene();
        }

    }

    // Fill the buffer with the values that define a letter 'F'.
    setGeometry(gl) {
        var positions = new Float32Array([
            // left column front
            0, 0, 0,
            0, 150, 0,
            30, 0, 0,
            0, 150, 0,
            30, 150, 0,
            30, 0, 0,

            // top rung front
            30, 0, 0,
            30, 30, 0,
            100, 0, 0,
            30, 30, 0,
            100, 30, 0,
            100, 0, 0,

            // middle rung front
            30, 60, 0,
            30, 90, 0,
            67, 60, 0,
            30, 90, 0,
            67, 90, 0,
            67, 60, 0,

            // left column back
            0, 0, 30,
            30, 0, 30,
            0, 150, 30,
            0, 150, 30,
            30, 0, 30,
            30, 150, 30,

            // top rung back
            30, 0, 30,
            100, 0, 30,
            30, 30, 30,
            30, 30, 30,
            100, 0, 30,
            100, 30, 30,

            // middle rung back
            30, 60, 30,
            67, 60, 30,
            30, 90, 30,
            30, 90, 30,
            67, 60, 30,
            67, 90, 30,

            // top
            0, 0, 0,
            100, 0, 0,
            100, 0, 30,
            0, 0, 0,
            100, 0, 30,
            0, 0, 30,

            // top rung right
            100, 0, 0,
            100, 30, 0,
            100, 30, 30,
            100, 0, 0,
            100, 30, 30,
            100, 0, 30,

            // under top rung
            30, 30, 0,
            30, 30, 30,
            100, 30, 30,
            30, 30, 0,
            100, 30, 30,
            100, 30, 0,

            // between top rung and middle
            30, 30, 0,
            30, 60, 30,
            30, 30, 30,
            30, 30, 0,
            30, 60, 0,
            30, 60, 30,

            // top of middle rung
            30, 60, 0,
            67, 60, 30,
            30, 60, 30,
            30, 60, 0,
            67, 60, 0,
            67, 60, 30,

            // right of middle rung
            67, 60, 0,
            67, 90, 30,
            67, 60, 30,
            67, 60, 0,
            67, 90, 0,
            67, 90, 30,

            // bottom of middle rung.
            30, 90, 0,
            30, 90, 30,
            67, 90, 30,
            30, 90, 0,
            67, 90, 30,
            67, 90, 0,

            // right of bottom
            30, 90, 0,
            30, 150, 30,
            30, 90, 30,
            30, 90, 0,
            30, 150, 0,
            30, 150, 30,

            // bottom
            0, 150, 0,
            0, 150, 30,
            30, 150, 30,
            0, 150, 0,
            30, 150, 30,
            30, 150, 0,

            // left side
            0, 0, 0,
            0, 0, 30,
            0, 150, 30,
            0, 0, 0,
            0, 150, 30,
            0, 150, 0]);

        // Center the F around the origin and Flip it around. We do this because
        // we're in 3D now with and +Y is up where as before when we started with 2D
        // we had +Y as down.

        // We could do by changing all the values above but I'm lazy.
        // We could also do it with a matrix at draw time but you should
        // never do stuff at draw time if you can do it at init time.
        var matrix = m4.xRotation(Math.PI);
        matrix = m4.translate(matrix, -50, -75, -15);

        for (var ii = 0; ii < positions.length; ii += 3) {
            var vector = m4.transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
            positions[ii + 0] = vector[0];
            positions[ii + 1] = vector[1];
            positions[ii + 2] = vector[2];
        }

        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    }

    //! 设置法线，这里的法线是指每个面的法线，所以也是一个面需要6个点即可
    setNormals(gl) {
        var normals = new Float32Array([
            // left column front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // top rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // middle rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // left column back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // top rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // middle rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // top rung right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // under top rung
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // between top rung and middle
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // top of middle rung
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // right of middle rung
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // bottom of middle rung.
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // right of bottom
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // left side
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0]);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    }
}
new App();
