import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';

interface ThreeJSAudioVisualizerProps {
  analyser: AnalyserNode;
}

const ThreeJSAudioVisualizer: React.FC<ThreeJSAudioVisualizerProps> = ({ analyser }) => {
  const mountRef = useRef<HTMLDivElement>(null);

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
    scene.add(group);

    const icosahedronGeometry = new THREE.IcosahedronGeometry(10, 10);
    const lambertMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    const ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    ball.position.set(0, 0, 0);
    group.add(ball);

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    });
    const glowBall = new THREE.Mesh(icosahedronGeometry, glowMaterial);
    glowBall.position.set(0, 0, 0);
    glowBall.scale.set(1.05, 1.05, 1.05);
    group.add(glowBall);
    
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(ball);
    spotLight.castShadow = true;
    scene.add(spotLight);

    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const noise = new SimplexNoise();
    let animationFrameId: number;

    const modulate = (val: number, minVal: number, maxVal: number, outMin: number, outMax: number) => {
        const fr = (val - minVal) / (maxVal - minVal);
        const delta = outMax - outMin;
        return outMin + fr * delta;
    };

    const makeRoughBall = (mesh: THREE.Mesh, bassFr: number, treFr: number) => {
        const vertices = mesh.geometry.getAttribute('position');
        const radius = (mesh.geometry as THREE.IcosahedronGeometry).parameters.radius;
        const time = window.performance.now();
        const rf = 0.00001;

        for (let i = 0; i < vertices.count; i++) {
            const vertex = new THREE.Vector3().fromBufferAttribute(vertices, i);
            vertex.normalize();
            const distance = (radius + bassFr) + noise.noise3d(vertex.x + time * rf * 7, vertex.y + time * rf * 8, vertex.z + time * rf * 9) * 7 * treFr;
            vertex.multiplyScalar(distance);
            vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        vertices.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
    };

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      const lowerHalfArray = dataArray.slice(0, dataArray.length / 2 - 1);
      const upperHalfArray = dataArray.slice(dataArray.length / 2 - 1, dataArray.length - 1);

      const lowerMax = Math.max(...lowerHalfArray);
      const upperAvg = upperHalfArray.reduce((sum, a) => sum + a, 0) / upperHalfArray.length;

      const lowerMaxFr = lowerMax / lowerHalfArray.length;
      const upperAvgFr = upperAvg / upperHalfArray.length;

      makeRoughBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
      makeRoughBall(glowBall, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));

      group.rotation.y += 0.005;
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
      icosahedronGeometry.dispose();
      lambertMaterial.dispose();
      glowMaterial.dispose();
      renderer.dispose();
    };
  }, [analyser]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', zIndex: -1 }} />;
};

export default ThreeJSAudioVisualizer;
