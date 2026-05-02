'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface Academic3DProps {
    className?: string;
    interactive?: boolean;
    autoRotate?: boolean;
    props?: string[]; // List of props to show: 'book', 'scroll', 'globe', 'quill', 'lamp', 'trophy'
}

const Academic3DProps: React.FC<Academic3DProps> = ({
    className = '',
    interactive = true,
    autoRotate = true,
    props = ['book', 'scroll', 'globe', 'quill', 'lamp', 'trophy']
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        objects: THREE.Object3D[];
        animationId: number | null;
        rotationSpeed: number;
        mouseX: number;
        mouseY: number;
        targetRotationX: number;
        targetRotationY: number;
    } | null>(null);

    const [selectedProp, setSelectedProp] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Academic color palette
    const academicColors = {
        book: 0x1a237e,      // Deep blue
        scroll: 0x5d4037,    // Brown parchment
        globe: 0x0277bd,     // Ocean blue
        quill: 0x8d6e63,     // Feather brown
        lamp: 0xffb300,      // Golden lamp
        trophy: 0xffd600,    // Gold trophy
        default: 0x3949ab    // Academic purple
    };

    // Create academic prop geometries
    const createPropGeometry = (type: string): THREE.BufferGeometry | THREE.Group => {
        switch (type) {
            case 'book':
                return new THREE.BoxGeometry(2, 0.3, 1.5);

            case 'scroll':
                return new THREE.CylinderGeometry(0.1, 0.1, 2, 8);

            case 'globe':
                return new THREE.SphereGeometry(0.8, 32, 32);

            case 'quill':
                const quillGroup = new THREE.Group();

                // Quill shaft (cylinder)
                const shaft = new THREE.CylinderGeometry(0.02, 0.01, 1.5, 8);
                const shaftMesh = new THREE.Mesh(shaft);
                shaftMesh.position.y = 0.75;
                quillGroup.add(shaftMesh);

                // Quill tip (cone)
                const tip = new THREE.ConeGeometry(0.05, 0.3, 8);
                const tipMesh = new THREE.Mesh(tip);
                tipMesh.position.y = 1.65;
                quillGroup.add(tipMesh);

                return quillGroup;

            case 'lamp':
                const lampGroup = new THREE.Group();

                // Lamp base
                const base = new THREE.CylinderGeometry(0.3, 0.4, 0.2, 16);
                const baseMesh = new THREE.Mesh(base);
                baseMesh.position.y = 0.1;
                lampGroup.add(baseMesh);

                // Lamp stem
                const stem = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
                const stemMesh = new THREE.Mesh(stem);
                stemMesh.position.y = 1.0;
                lampGroup.add(stemMesh);

                // Lamp shade (truncated cone)
                const shade = new THREE.ConeGeometry(0.6, 0.8, 16);
                const shadeMesh = new THREE.Mesh(shade);
                shadeMesh.position.y = 1.9;
                lampGroup.add(shadeMesh);

                return lampGroup;

            case 'trophy':
                const trophyGroup = new THREE.Group();

                // Trophy base
                const trophyBase = new THREE.CylinderGeometry(0.5, 0.6, 0.2, 16);
                const baseTrophyMesh = new THREE.Mesh(trophyBase);
                baseTrophyMesh.position.y = 0.1;
                trophyGroup.add(baseTrophyMesh);

                // Trophy stem
                const trophyStem = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
                const stemTrophyMesh = new THREE.Mesh(trophyStem);
                stemTrophyMesh.position.y = 0.6;
                trophyGroup.add(stemTrophyMesh);

                // Trophy cup (sphere)
                const cup = new THREE.SphereGeometry(0.4, 16, 16);
                const cupMesh = new THREE.Mesh(cup);
                cupMesh.position.y = 1.2;
                trophyGroup.scale.set(0.8, 0.8, 0.8);
                trophyGroup.add(cupMesh);

                return trophyGroup;

            default:
                return new THREE.BoxGeometry(1, 1, 1);
        }
    };

    const initThree = () => {
        if (!containerRef.current || sceneRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.Fog(0x0a0a1a, 5, 30);

        // Camera
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(0, 2, 10);

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x4fc3f7, 1, 20);
        pointLight.position.set(-3, 3, 3);
        scene.add(pointLight);

        // Create academic props in a circular arrangement
        const objects: THREE.Object3D[] = [];
        const radius = 4;
        const angleStep = (2 * Math.PI) / props.length;

        props.forEach((propType, index) => {
            const angle = index * angleStep;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const geometry = createPropGeometry(propType);
            const color = academicColors[propType as keyof typeof academicColors] || academicColors.default;

            let object: THREE.Object3D;

            if (geometry instanceof THREE.BufferGeometry) {
                const material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.4,
                    roughness: 0.3,
                    emissive: color,
                    emissiveIntensity: 0.1
                });

                object = new THREE.Mesh(geometry, material);
            } else {
                // It's a Group
                object = geometry;
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            color: color,
                            metalness: 0.3,
                            roughness: 0.4
                        });
                    }
                });
            }

            object.position.set(x, 0, z);
            object.rotation.y = angle;
            object.scale.set(1, 1, 1);

            // Add hover interaction
            object.userData = { type: propType, originalY: 0 };

            scene.add(object);
            objects.push(object);
        });

        // Add a platform
        const platformGeometry = new THREE.CylinderGeometry(radius + 2, radius + 2, 0.2, 32);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.2,
            roughness: 0.8
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = -0.2;
        platform.receiveShadow = true;
        scene.add(platform);

        sceneRef.current = {
            scene,
            camera,
            renderer,
            objects,
            animationId: null,
            rotationSpeed: autoRotate ? 0.002 : 0,
            mouseX: 0,
            mouseY: 0,
            targetRotationX: 0,
            targetRotationY: 0
        };

        setIsInitialized(true);
    };

    const animate = () => {
        if (!sceneRef.current) return;

        const { scene, camera, renderer, objects, rotationSpeed, targetRotationX, targetRotationY } = sceneRef.current;

        // Auto-rotate camera
        if (rotationSpeed > 0) {
            camera.position.x = Math.sin(Date.now() * 0.0005) * 10;
            camera.position.z = Math.cos(Date.now() * 0.0005) * 10;
            camera.lookAt(0, 0, 0);
        } else if (interactive) {
            // Mouse-based rotation
            camera.position.x = Math.sin(targetRotationX) * 10;
            camera.position.z = Math.cos(targetRotationX) * 10;
            camera.position.y = 2 + targetRotationY * 3;
            camera.lookAt(0, 0, 0);
        }

        // Animate objects with floating effect
        objects.forEach((object, index) => {
            const time = Date.now() * 0.001;
            const floatHeight = Math.sin(time + index) * 0.3;
            object.position.y = floatHeight;

            // Gentle rotation
            object.rotation.y += 0.005;

            // Pulsing glow for selected prop
            if (selectedProp === object.userData.type) {
                const pulse = Math.sin(time * 3) * 0.2 + 0.8;
                object.scale.setScalar(pulse);

                // Emissive pulse
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                        child.material.emissiveIntensity = 0.3 + Math.sin(time * 5) * 0.1;
                    }
                });
            } else {
                object.scale.setScalar(1);
            }
        });

        renderer.render(scene, camera);
        sceneRef.current.animationId = requestAnimationFrame(animate);
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

    const handleMouseMove = (event: MouseEvent) => {
        if (!sceneRef.current || !interactive) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        sceneRef.current.targetRotationX = x * Math.PI * 0.5;
        sceneRef.current.targetRotationY = y * 0.5;
    };

    const handleClick = (event: MouseEvent) => {
        if (!sceneRef.current || !interactive) return;

        const { camera, renderer, objects } = sceneRef.current;

        // Calculate mouse position in normalized device coordinates
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        // Raycasting
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(objects, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            let propType = clickedObject.userData.type;

            // Traverse up to find parent with userData
            let current: THREE.Object3D | null = clickedObject;
            while (current && !propType) {
                current = current.parent;
                if (current && current.userData && current.userData.type) {
                    propType = current.userData.type;
                }
            }

            if (propType) {
                setSelectedProp(propType === selectedProp ? null : propType);

                // Visual feedback
                objects.forEach(obj => {
                    if (obj.userData.type === propType) {
                        // Highlight effect
                        obj.traverse((child) => {
                            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                                child.material.emissive.setHex(0xffffff);
                                child.material.emissiveIntensity = 0.5;

                                // Reset after delay
                                setTimeout(() => {
                                    if (child.material instanceof THREE.MeshStandardMaterial) {
                                        const color = academicColors[propType as keyof typeof academicColors] || academicColors.default;
                                        child.material.emissive.setHex(color);
                                        child.material.emissiveIntensity = 0.1;
                                    }
                                }, 300);
                            }
                        });
                    }
                });
            }
        }
    };

    useEffect(() => {
        initThree();

        if (sceneRef.current) {
            animate();
            window.addEventListener('resize', handleResize);

            if (interactive) {
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('click', handleClick);
            }
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

                window.removeEventListener('resize', handleResize);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('click', handleClick);
            }

            sceneRef.current = null;
        };
    }, [interactive, autoRotate]);

    return (
        <div className={`relative ${className}`}>
            <div
                ref={containerRef}
                className="w-full h-full rounded-2xl overflow-hidden"
                style={{ minHeight: '500px' }}
            />

            {selectedProp && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                    Selected: <span className="font-bold capitalize">{selectedProp}</span>
                </div>
            )}

            {!isInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl">
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Loading Academic Collection...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Academic3DProps;