"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 벽난로 컴포넌트
export default function Fireplace() {
  const fireRef = useRef();
  
  useEffect(() => {
    if (!fireRef.current) return;
    
    // 불 파티클 시스템 생성
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
      // 파티클 위치 (벽난로 주변에 랜덤하게 배치)
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = Math.random() * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      
      // 파티클 색상 (불 색상: 빨간색 ~ 노란색)
      const colorFactor = Math.random();
      color.setHSL(0.1 * colorFactor, 1.0, 0.5 + 0.5 * colorFactor);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // 파티클 크기
      sizes[i] = Math.random() * 0.03 + 0.01;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // 파티클 재질
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    // 파티클 시스템 생성
    const particleSystem = new THREE.Points(particles, material);
    
    // 씬에 추가
    fireRef.current.add(particleSystem);
    
    // 애니메이션 함수
    const animate = () => {
      const positions = particles.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        // 파티클 위치 업데이트 (위로 올라가는 효과)
        positions[i * 3 + 1] += 0.01 * Math.random();
        
        // 파티클이 너무 높이 올라가면 다시 아래로 리셋
        if (positions[i * 3 + 1] > 0.5) {
          positions[i * 3 + 1] = 0;
        }
      }
      
      particles.attributes.position.needsUpdate = true;
    };
    
    // 애니메이션 루프 설정
    const animationId = setInterval(animate, 16);
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      clearInterval(animationId);
      particleSystem.geometry.dispose();
      particleSystem.material.dispose();
    };
  }, []);
  
  return <group ref={fireRef} position={[0, 0, 0]} />;
}
