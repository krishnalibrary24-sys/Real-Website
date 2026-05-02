'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface ParallaxMouseBackgroundProps {
    className?: string;
    intensity?: number;
    layers?: number;
}

const ParallaxMouseBackground: React.FC<ParallaxMouseBackgroundProps> = ({
    className = '',
    intensity = 0.5,
    layers = 5
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        meshes: THREE.Mesh[];
        animationId: number | null;
        mouse: THREE.Vector2;
        targetMouse: THREE.Vector2;
    } | null>(null);

    const [isInitialized, setIsInitialized] = useState(false);

    // Academic/library themed colors
    const layerColors = [
        new THREE.Color(0x1a237e), // Deep blue (books)
        new THREE.Color(0x283593), // Royal blue (knowledge)
        new THREE.Color(0x303f9f), // Medium blue (wisdom)
        new THREE.Color(0x3949ab), // Light blue (learning)
        new THREE.Color(0x5c6bc0), // Pale blue (academia)
    ];

    // Academic shapes: books, scrolls, quills, etc.
    const createAcademicShape = (layerIndex: number, totalLayers: number) => {
        const shapes = [];

        // Book shape
        const bookGeometry = new THREE.BoxGeometry(2, 0.3, 1.5);
        bookGeometry.translate(0, 0.15, 0);

        // Scroll shape
        const scrollGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);

        // Quill shape (cone + cylinder)
        const quillGeometry = new THREE.ConeGeometry(0.05, 0.8, 8);
        quillGeometry.translate(0, 0.4, 0);

        // Globe shape
        const globeGeometry = new THREE.SphereGeometry(0.5, 16, 16);

        // Choose shape based on layer
        const shapeType = layerIndex % 4;

        switch (shapeType) {
            case 0: return bookGeometry;
            case 1: return scrollGeometry;
            case 2: return quillGeometry;
            case 3: return globeGeometry;
            default: return bookGeometry;
        }
    };

    const initThree = () => {
        if (!containerRef.current || sceneRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

        // Camera
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 15;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Create layered academic objects
        const meshes: THREE.Mesh[] = [];

        for (let i = 0; i < layers; i++) {
            const depth = (i + 1) * 3;
            const geometry = createAcademicShape(i, layers);

            // Create material with academic color
            const material = new THREE.MeshStandardMaterial({
                color: layerColors[i % layerColors.length],
                metalness: 0.3,
                roughness: 0.7,
                transparent: true,
                opacity: 0.8 - (i * 0.1),
                emissive: layerColors[i % layerColors.length],
                emissiveIntensity: 0.1
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Position in a grid pattern
            const gridSize = Math.ceil(Math.sqrt(layers));
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;

            mesh.position.set(
                (col - gridSize / 2) * 4,
                (row - gridSize / 2) * 3,
                -depth
            );

            // Random rotation
            mesh.rotation.set(
                Math.random() * Math.PI * 0.1,
                Math.random() * Math.PI * 0.1,
                Math.random() * Math.PI * 0.1
            );

            // Scale based on layer
            const scale = 0.8 + (i * 0.1);
            mesh.scale.set(scale, scale, scale);

            scene.add(mesh);
            meshes.push(mesh);
        }

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Add point lights for academic glow
        const pointLight1 = new THREE.PointLight(0x4fc3f7, 1, 20);
        pointLight1.position.set(-5, 3, 5);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x7c4dff, 0.8, 20);
        pointLight2.position.set(5, -3, 8);
        scene.add(pointLight2);

        // Mouse tracking
        const mouse = new THREE.Vector2(0, 0);
        const targetMouse = new THREE.Vector2(0, 0);

        sceneRef.current = {
            scene,
            camera,
            renderer,
            meshes,
            animationId: null,
            mouse,
            targetMouse
        };

        setIsInitialized(true);
    };

    const animate = () => {
        if (!sceneRef.current) return;

        const { scene, camera, renderer, meshes, mouse, targetMouse } = sceneRef.current;

        // Smooth mouse movement
        mouse.lerp(targetMouse, 0.05);

        // Update camera position based on mouse
        camera.position.x = mouse.x * intensity * 2;
        camera.position.y = -mouse.y * intensity * 2;
        camera.lookAt(0, 0, 0);

        // Animate meshes with parallax effect
        meshes.forEach((mesh, i) => {
            const depthFactor = (i + 1) / layers;

            // Parallax movement
            mesh.position.x += (mouse.x * depthFactor * 0.5 - mesh.position.x * 0.01) * 0.1;
            mesh.position.y += (-mouse.y * depthFactor * 0.5 - mesh.position.y * 0.01) * 0.1;

            // Gentle floating animation
            mesh.rotation.x += 0.001 * depthFactor;
            mesh.rotation.y += 0.002 * depthFactor;

            // Pulsing scale effect
            const pulse = Math.sin(Date.now() * 0.001 + i) * 0.05 * depthFactor;
            mesh.scale.setScalar(0.8 + (i * 0.1) + pulse);
        });

        renderer.render(scene, camera);
        sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!sceneRef.current) return;

        const { targetMouse } = sceneRef.current;

        // Normalize mouse coordinates to [-1, 1]
        targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
        if (!sceneRef.current || !containerRef.current) return;

        const { camera, renderer } = sceneRef.current;
        const container = containerRef.current;

        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    useEffect(() => {
        initThree();

        if (sceneRef.current) {
            animate();
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('resize', handleResize);
        }

        return () => {
            if (sceneRef.current) {
                const { animationId, renderer } = sceneRef.current;

                if (animationId) {
                    cancelAnimationFrame(animationId);
                }

                if (renderer && containerRef.current) {
                    containerRef.current.removeChild(renderer.domElement);
                }

                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('resize', handleResize);
            }

            sceneRef.current = null;
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden ${className}`}
            style={{
                pointerEvents: 'none',
                zIndex: -1
            }}
        >
            {!isInitialized && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
            )}
        </div>
    );
};

export default ParallaxMouseBackground;