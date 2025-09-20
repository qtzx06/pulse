import React, { useRef, useEffect, memo } from 'react';
import vertShaderSource from '../shaders/neuro.vert?raw';
import fragShaderSource from '../shaders/neuro.frag?raw';
import './NeuroShaderCanvas.css';

const NeuroShaderCanvas: React.FC = memo(() => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;

        const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
        const pointer = { x: 0, y: 0, tX: 0, tY: 0 };
        let uniforms: { [key: string]: WebGLUniformLocation | null };

        const gl = initShader();
        if (!gl) return;

        setupEvents();
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let animationFrameId: number;
        const renderLoop = () => {
            const currentTime = performance.now();
            pointer.x += (pointer.tX - pointer.x) * 0.5;
            pointer.y += (pointer.tY - pointer.y) * 0.5;

            gl.uniform1f(uniforms.u_time, currentTime);
            gl.uniform2f(uniforms.u_pointer_position, pointer.x / window.innerWidth, 1 - pointer.y / window.innerHeight);
            gl.uniform1f(uniforms.u_scroll_progress, window.pageYOffset / (2 * window.innerHeight));

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        function initShader(): WebGLRenderingContext | null {
            const gl = canvasEl.getContext('webgl') || canvasEl.getContext('experimental-webgl');
            if (!gl) {
                alert('WebGL is not supported by your browser.');
                return null;
            }

            const createShader = (gl: WebGLRenderingContext, sourceCode: string, type: number) => {
                const shader = gl.createShader(type);
                if (!shader) return null;
                gl.shaderSource(shader, sourceCode);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                    gl.deleteShader(shader);
                    return null;
                }
                return shader;
            };

            const vertexShader = createShader(gl, vertShaderSource, gl.VERTEX_SHADER);
            const fragmentShader = createShader(gl, fragShaderSource, gl.FRAGMENT_SHADER);
            if (!vertexShader || !fragmentShader) return null;

            const createShaderProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
                const program = gl.createProgram();
                if (!program) return null;
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
                    return null;
                }
                return program;
            };

            const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
            if (!shaderProgram) return null;

            const getUniforms = (program: WebGLProgram) => {
                let uniforms: { [key: string]: WebGLUniformLocation | null } = {};
                let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
                for (let i = 0; i < uniformCount; i++) {
                    let uniformName = gl.getActiveUniform(program, i)?.name;
                    if (uniformName) {
                        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
                    }
                }
                return uniforms;
            };
            
            uniforms = getUniforms(shaderProgram);

            const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
            const vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            gl.useProgram(shaderProgram);

            const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            return gl;
        }

        function resizeCanvas() {
            if (!gl) return;
            canvasEl.width = window.innerWidth * devicePixelRatio;
            canvasEl.height = window.innerHeight * devicePixelRatio;
            gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height);
            gl.viewport(0, 0, canvasEl.width, canvasEl.height);
        }

        function setupEvents() {
            const updateMousePosition = (eX: number, eY: number) => {
                pointer.tX = eX;
                pointer.tY = eY;
            };
            window.addEventListener('pointermove', e => updateMousePosition(e.clientX, e.clientY));
            window.addEventListener('touchmove', e => updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY));
            window.addEventListener('click', e => updateMousePosition(e.clientX, e.clientY));
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas id="neuro" ref={canvasRef}></canvas>;
});

export default NeuroShaderCanvas;