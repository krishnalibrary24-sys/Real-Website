'use client';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	const { theme } = useTheme();

	const containerRef = useRef<HTMLDivElement>(null);
	const requestRef = useRef<number>(0);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		particles: THREE.Points;
		geometry: THREE.BufferGeometry;
		material: THREE.PointsMaterial;
	} | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const SEPARATION = 150;
		const AMOUNTX = 40;
		const AMOUNTY = 60;

		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

		const camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			10000,
		);
		camera.position.set(0, 355, 1220);

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(scene.fog.color, 0);

		containerRef.current.appendChild(renderer.domElement);

		const positions: number[] = [];
		const colors: number[] = [];

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
				const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
				positions.push(x, 0, z);
				if (theme === 'dark') {
					colors.push(0.8, 0.8, 0.8);
				} else {
					colors.push(0, 0, 0);
				}
			}
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		const material = new THREE.PointsMaterial({
			size: 8,
			vertexColors: true,
			transparent: true,
			opacity: 0.8,
			sizeAttenuation: true,
		});

		const points = new THREE.Points(geometry, material);
		scene.add(points);

		sceneRef.current = {
			scene,
			camera,
			renderer,
			particles: points,
			geometry,
			material
		};

		let count = 0;
		const animate = () => {
			requestRef.current = requestAnimationFrame(animate);
			
			const posAttr = geometry.attributes.position;
			const posArray = posAttr.array as Float32Array;

			let i = 0;
			for (let ix = 0; ix < AMOUNTX; ix++) {
				for (let iy = 0; iy < AMOUNTY; iy++) {
					const index = i * 3;
					posArray[index + 1] = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50;
					i++;
				}
			}

			posAttr.needsUpdate = true;
			renderer.render(scene, camera);
			count += 0.1;
		};

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener('resize', handleResize);
		animate();

		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(requestRef.current);
			
			if (sceneRef.current) {
				scene.remove(points);
				geometry.dispose();
				material.dispose();
				renderer.dispose();
				if (containerRef.current && renderer.domElement) {
					containerRef.current.removeChild(renderer.domElement);
				}
			}
		};
	}, [theme]);

	return (
		<div
			ref={containerRef}
			className={cn('pointer-events-none fixed inset-0 -z-10', className)}
			{...props}
		/>
	);
}
