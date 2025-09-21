import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';

interface ThreeJSAudioVisualizerProps {
  analyser: AnalyserNode;
  isFlickerComplete: boolean;
}

const ThreeJSAudioVisualizer: React.FC<ThreeJSAudioVisualizerProps> = ({ analyser, isFlickerComplete }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  // Effect for Three.js setup and the main render loop
  useEffect(() => {
    if (!mountRef.current || !analyser) {
      return;
    }

    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    groupRef.current = group;
    group.scale.set(0.6, 0.6, 0.6);
    scene.add(group);

    // Use a more complex TorusKnot geometry for a "cool design"
    const geometry = new THREE.TorusKnotGeometry(8, 1.2, 256, 20);
    
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 lightDirection;
        void main() {
          float intensity = dot(vNormal, lightDirection);
          float gray;
          if (intensity > 0.8) gray = 0.1;
          else if (intensity > 0.4) gray = 0.4;
          else gray = 0.8;
          gl_FragColor = vec4(gray, gray, gray, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    group.add(mesh);

    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const noise = new SimplexNoise();
    let animationFrameId: number;

    let lastActiveTime = performance.now();
    const idleTimeout = 1500;
    const silenceThreshold = 2;

    const modulate = (val: number, minVal: number, maxVal: number, outMin: number, outMax: number) => {
        const fr = (val - minVal) / (maxVal - minVal);
        const delta = outMax - outMin;
        return outMin + fr * delta;
    };

    const distortMesh = (mesh: THREE.Mesh, bassFr: number, treFr: number) => {
        const vertices = mesh.geometry.getAttribute('position');
        const radius = (mesh.geometry as THREE.TorusKnotGeometry).parameters.radius;
        const time = window.performance.now();
        
        const rf1 = 0.00001, rf2 = 0.00008, amp1 = 6, amp2 = 1.5;

        for (let i = 0; i < vertices.count; i++) {
            const vertex = new THREE.Vector3().fromBufferAttribute(vertices, i);
            vertex.normalize();
            
            const noiseVal1 = noise.noise3d(vertex.x + time * rf1 * 7, vertex.y + time * rf1 * 8, vertex.z + time * rf1 * 9);
            const noiseVal2 = noise.noise3d(vertex.x + time * rf2 * 5, vertex.y + time * rf2 * 6, vertex.z + time * rf2 * 7);
            
            const distortion = (noiseVal1 * amp1 * treFr) + (noiseVal2 * amp2 * treFr);
            const distance = radius + bassFr + distortion;

            vertex.multiplyScalar(distance);
            vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        vertices.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
    };

    const render = () => {
      analyser.getByteFrequencyData(dataArray);
      const averageFrequency = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const isActive = averageFrequency > silenceThreshold;

      if (isActive) {
        lastActiveTime = performance.now();
        const lowerHalfArray = dataArray.slice(0, dataArray.length / 2 - 1);
        const upperHalfArray = dataArray.slice(dataArray.length / 2 - 1, dataArray.length - 1);
        const lowerMax = Math.max(...lowerHalfArray);
        const upperAvg = upperHalfArray.reduce((sum, a) => sum + a, 0) / upperHalfArray.length;
        const lowerMaxFr = lowerMax / lowerHalfArray.length;
        const upperAvgFr = upperAvg / upperHalfArray.length;

        distortMesh(mesh, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
        group.rotation.y += 0.005;
      } else {
        const now = performance.now();
        if (now - lastActiveTime > idleTimeout) {
          group.rotation.y += 0.001;
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    const onWindowResize = () => {
      if (currentMount) {
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    window.addEventListener('resize', onWindowResize, false);
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.remove(group);
      geometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, [analyser]);

  // Effect for the expansion animation
  useEffect(() => {
    if (isFlickerComplete && groupRef.current) {
      const group = groupRef.current;
      const targetScale = 1.2;
      const duration = 1200;
      const startTime = performance.now();
      let animationFrameId: number;

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeOutProgress = 1 - Math.pow(1 - progress, 4);

        const currentScale = 0.6 + (targetScale - 0.6) * easeOutProgress;
        group.scale.set(currentScale, currentScale, currentScale);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      animationFrameId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [isFlickerComplete]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', zIndex: -1 }} />;
};

export default ThreeJSAudioVisualizer;
