'use client';
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ParticleWaveProps {
  className?: string;
}

const ParticleWave: React.FC<ParticleWaveProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    particleMaterial: THREE.ShaderMaterial;
    animationId: number | null;
    mouse: THREE.Vector2;
  } | null>(null);

  // Function to detect current theme
  const getCurrentTheme = () => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  };

  // Function to get background color based on theme
  const getBackgroundColor = (theme: string) => {
    return theme === 'dark' 
      ? new THREE.Color(0x000000) // Black background for dark theme
      : new THREE.Color(0xffffff); // White background for light theme
  };

  // Function to get particle color based on theme
  const getParticleColor = (theme: string) => {
    return theme === 'dark' 
      ? new THREE.Vector3(1.0, 1.0, 1.0) // White particles for dark theme
      : new THREE.Vector3(0.0, 0.0, 0.0); // Black particles for light theme
  };

  const particleVertex = `
    attribute float scale;
    uniform float uTime;
    void main() {
      vec3 p = position;
      float s = scale;
      p.y += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
      p.x += (sin(p.y + uTime) * 0.5);
      s += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = s * 15.0 * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const particleFragment = `
    uniform vec3 uColor;
    uniform vec2 uMouse;
    void main() {
      float dist = distance(gl_FragCoord.xy, uMouse);
      float radius = 350.0; // The light radius
      float alpha = 1.0 - smoothstep(0.0, radius, dist);
      
      if (alpha <= 0.02) discard; // hide particles far away
      
      gl_FragColor = vec4(uColor, alpha * 0.7);
    }
  `;

  const initScene = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    const aspectRatio = winWidth / winHeight;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.01, 1000);
    camera.position.set(0, 6, 5);

    // Scene
    const scene = new THREE.Scene();

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true, // Allow transparent background so it plays well with NextThemes or our wrapper
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(winWidth, winHeight);
    
    // Set initial background color based on theme
    const currentTheme = getCurrentTheme();
    // Use an incredibly dark blue for the dark theme to match the library aesthetic, instead of pure black.
    const bgColor = currentTheme === 'dark' ? new THREE.Color(0x060e20) : new THREE.Color(0xffffff);
    renderer.setClearColor(bgColor);

    // Particles
    const gap = 0.3;
    const amountX = 200;
    const amountY = 200;
    const particleNum = amountX * amountY;
    const particlePositions = new Float32Array(particleNum * 3);
    const particleScales = new Float32Array(particleNum);
    
    let i = 0;
    let j = 0;
    for (let ix = 0; ix < amountX; ix++) {
      for (let iy = 0; iy < amountY; iy++) {
        particlePositions[i] = ix * gap - ((amountX * gap) / 2);
        particlePositions[i + 1] = 0;
        particlePositions[i + 2] = iy * gap - ((amountX * gap) / 2);
        particleScales[j] = 1;
        i += 3;
        j++;
      }
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uTime: { type: 'f', value: 0 },
        // Use a nice light blue/white color for the particles in dark theme
        uColor: { type: 'v3', value: currentTheme === 'dark' ? new THREE.Vector3(0.6, 0.7, 1.0) : new THREE.Vector3(0.0, 0.0, 0.0) },
        uMouse: { type: 'v2', value: new THREE.Vector2(-10000, -10000) }
      }
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const mouse = new THREE.Vector2(-10000, -10000);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles,
      particleMaterial,
      animationId: null,
      mouse
    };
  };

  const animate = () => {
    if (!sceneRef.current) return;

    const { scene, camera, renderer, particleMaterial } = sceneRef.current;
    
    particleMaterial.uniforms.uTime.value += 0.05;
    
    // Update particle color and background based on current theme
    const currentTheme = getCurrentTheme();
    const particleColor = currentTheme === 'dark' ? new THREE.Vector3(0.6, 0.7, 1.0) : new THREE.Vector3(0.0, 0.0, 0.0);
    const bgColor = currentTheme === 'dark' ? new THREE.Color(0x060e20) : new THREE.Color(0xffffff);

    particleMaterial.uniforms.uColor.value = particleColor;
    particleMaterial.uniforms.uMouse.value.copy(sceneRef.current.mouse);
    renderer.setClearColor(bgColor);
    
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
    
    sceneRef.current.animationId = requestAnimationFrame(animate);
  };

  const handleResize = () => {
    if (!sceneRef.current) return;

    const { camera, renderer } = sceneRef.current;
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    camera.aspect = winWidth / winHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(winWidth, winHeight);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!sceneRef.current) return;
    
    // WebGL gl_FragCoord is in physical pixels, with Y=0 at the bottom.
    const pixelRatio = window.devicePixelRatio;
    sceneRef.current.mouse.x = e.clientX * pixelRatio;
    sceneRef.current.mouse.y = (window.innerHeight - e.clientY) * pixelRatio;
  };

  useEffect(() => {
    initScene();
    animate();

    const handleResizeEvent = () => handleResize();
    const handleMouseMoveEvent = (e: MouseEvent) => handleMouseMove(e);

    window.addEventListener('resize', handleResizeEvent);
    window.addEventListener('mousemove', handleMouseMoveEvent);

    return () => {
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      window.removeEventListener('resize', handleResizeEvent);
      window.removeEventListener('mousemove', handleMouseMoveEvent);
      
      // Cleanup Three.js resources
      if (sceneRef.current) {
        const { scene, renderer, particles } = sceneRef.current;
        scene.remove(particles);
        if (particles.geometry) particles.geometry.dispose();
        if (particles.material) {
          if (Array.isArray(particles.material)) {
            particles.material.forEach(material => material.dispose());
          } else {
            particles.material.dispose();
          }
        }
        renderer.dispose();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`block ${className}`}
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        overflow: 'hidden'
      }}
    />
  );
};

export { ParticleWave };
