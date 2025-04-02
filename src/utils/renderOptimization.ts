"use client";

// 3D 렌더링 최적화를 위한 유틸리티 함수들
import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 화면 밖 객체 렌더링 중지 (Frustum Culling)
export function useFrustumCulling(group, margin = 1.2) {
  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (!group.current) return;
    
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4();
    
    // 객체의 바운딩 박스 계산
    const boundingBox = new THREE.Box3().setFromObject(group.current);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    // 바운딩 구 계산
    const radius = boundingBox.min.distanceTo(boundingBox.max) / 2 * margin;
    
    // 프레임마다 가시성 체크
    const checkVisibility = () => {
      matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(matrix);
      
      const isInView = frustum.intersectsSphere(new THREE.Sphere(center, radius));
      setIsVisible(isInView);
      
      if (group.current) {
        group.current.visible = isInView;
      }
    };
    
    // 렌더 루프에 체크 함수 추가
    const unsubscribeRender = useThree.subscribe(
      (state) => state.scene,
      checkVisibility
    );
    
    return () => {
      unsubscribeRender();
    };
  }, [group, camera, margin]);
  
  return isVisible;
}

// 거리에 따른 디테일 레벨 조정 (LOD)
export function useLevelOfDetail(group, distances = [10, 20, 30]) {
  const { camera } = useThree();
  const [detailLevel, setDetailLevel] = useState(0);
  
  useEffect(() => {
    if (!group.current) return;
    
    const checkDistance = () => {
      if (!group.current) return;
      
      const position = new THREE.Vector3();
      group.current.getWorldPosition(position);
      
      const distance = position.distanceTo(camera.position);
      
      // 거리에 따라 디테일 레벨 설정
      let newLevel = 0;
      for (let i = 0; i < distances.length; i++) {
        if (distance > distances[i]) {
          newLevel = i + 1;
        }
      }
      
      if (newLevel !== detailLevel) {
        setDetailLevel(newLevel);
      }
    };
    
    // 렌더 루프에 체크 함수 추가
    const unsubscribeRender = useThree.subscribe(
      (state) => state.camera,
      checkDistance
    );
    
    return () => {
      unsubscribeRender();
    };
  }, [group, camera, distances, detailLevel]);
  
  return detailLevel;
}

// 인스턴스 메시 최적화
export function useInstancedMesh(count, geometry, material) {
  const [instancedMesh, setInstancedMesh] = useState(null);
  
  useEffect(() => {
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    setInstancedMesh(mesh);
    
    return () => {
      mesh.dispose();
    };
  }, [geometry, material, count]);
  
  return instancedMesh;
}

// 텍스처 메모리 최적화
export function useOptimizedTexture(url, options = {}) {
  const [texture, setTexture] = useState(null);
  
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    loader.load(url, (loadedTexture) => {
      // 텍스처 최적화 설정
      loadedTexture.generateMipmaps = options.generateMipmaps !== false;
      loadedTexture.minFilter = options.minFilter || THREE.LinearMipmapLinearFilter;
      loadedTexture.magFilter = options.magFilter || THREE.LinearFilter;
      loadedTexture.anisotropy = options.anisotropy || 4;
      
      // 텍스처 압축 (WebGL 지원 시)
      if (options.compress && typeof window !== 'undefined') {
        // CompressedTextureFormat 대신 특정 압축 포맷 사용
        // loadedTexture.format = THREE.RGBA_ASTC_4x4_Format;
      }
      
      setTexture(loadedTexture);
    });
    
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [url, options, texture]);
  
  return texture;
}

// 모바일 디바이스 감지
export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkDevice();
    
    // 리사이즈 이벤트에서 디바이스 체크
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);
  
  return isMobile;
}

// 성능 모니터링
export function usePerformanceMonitoring() {
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(0);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let frames = 0;
    let lastTime = performance.now();
    
    const updateFPS = () => {
      const currentTime = performance.now();
      frames++;
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (currentTime - lastTime)));
        frames = 0;
        lastTime = currentTime;
        
        // 메모리 사용량 (Chrome 전용)
        if (window.performance && window.performance.memory) {
          setMemory(Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024)));
        }
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    const animationId = requestAnimationFrame(updateFPS);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return { fps, memory };
}

// 통합 최적화 훅
export function useOptimization() {
  const isMobile = useDeviceDetection();
  const { fps } = usePerformanceMonitoring();
  
  // 성능에 따른 최적화 설정
  const shouldUseSimplifiedGeometry = isMobile || fps < 30;
  const shouldDisableShadows = isMobile || fps < 20;
  const textureQuality = isMobile ? 'low' : fps < 40 ? 'medium' : 'high';
  
  return {
    isMobile,
    fps,
    shouldUseSimplifiedGeometry,
    shouldDisableShadows,
    textureQuality
  };
}
