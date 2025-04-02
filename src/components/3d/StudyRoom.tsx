"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, useAnimations } from '@react-three/drei';
import { useDetectGPU } from '@react-three/drei';
import { useOptimization } from '@/utils/renderOptimization';
import * as THREE from 'three';

// 임시 스터디룸 모델 컴포넌트 (GLB 파일이 없을 때 사용)
function PlaceholderRoom() {
  return (
    <group>
      {/* 바닥 */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      
      {/* 벽 */}
      <mesh position={[0, 1.5, -5]} receiveShadow>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      <mesh position={[-5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      <mesh position={[5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      {/* 책상 */}
      <mesh position={[0, 0.4, -2]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>
      
      {/* 책상 다리 */}
      <mesh position={[-1.4, 0, -1.5]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      
      <mesh position={[1.4, 0, -1.5]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      
      <mesh position={[-1.4, 0, -2.5]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      
      <mesh position={[1.4, 0, -2.5]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      
      {/* 의자 */}
      <mesh position={[0, 0.25, -0.5]} castShadow>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      
      {/* 의자 다리 */}
      <mesh position={[0.4, 0, -0.1]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#4e342e" />
      </mesh>
      
      <mesh position={[-0.4, 0, -0.1]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#4e342e" />
      </mesh>
      
      <mesh position={[0.4, 0, -0.9]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#4e342e" />
      </mesh>
      
      <mesh position={[-0.4, 0, -0.9]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#4e342e" />
      </mesh>
      
      {/* 의자 등받이 */}
      <mesh position={[0, 0.75, -1]} castShadow>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      
      {/* "모델 파일이 없습니다" 안내 메시지 (Text 컴포넌트 대신 간단한 판넬로 표시) */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[3, 0.6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* 노트북 */}
      <mesh position={[0, 0.45, -2]} castShadow>
        <boxGeometry args={[0.8, 0.05, 0.5]} />
        <meshStandardMaterial color="#424242" />
      </mesh>
      
      {/* 노트북 화면 */}
      <mesh position={[0, 0.6, -2.1]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
}

// 스터디룸 모델 컴포넌트
type RoomTheme = 'default' | 'cozy' | 'modern' | 'nature' | 'dark';

interface StudyRoomModelProps {
  hasFireplace: boolean;
  weatherType: 'clear' | 'rainy' | 'snowy';
  theme?: RoomTheme;
}

function StudyRoomModel({ hasFireplace, weatherType, theme = 'default' }: StudyRoomModelProps) {
  // Always use placeholder for now until we have a proper model
  return <PlaceholderRoom />;
  
  /* 
  // Original implementation with 3D model - commented out until we have a working model
  const [modelError, setModelError] = useState(true);
  
  useEffect(() => {
    // 모델 로드 시도
    const loadModel = async () => {
      try {
        const response = await fetch('/models/study_room.glb');
        if (!response.ok) {
          throw new Error(`Model not found: ${response.status}`);
        }
        // If we got here, the model exists
        setModelError(false);
      } catch (error) {
        console.error('Failed to load 3D model:', error);
        setModelError(true);
      }
    };
    
    loadModel();
  }, []);
  
  // 모델 에러가 있으면 플레이스홀더 반환
  if (modelError) {
    return <PlaceholderRoom />;
  }
  
  // If we're here, the model exists, so we can try to load it
  const { scene, animations } = useGLTF('/models/study_room.glb');
  const { actions } = useAnimations(animations, scene);
  const { isMobile, shouldUseSimplifiedGeometry } = useOptimization();
  
  // 테마에 따른 색상 설정
  useEffect(() => {
    // 테마별 색상 매핑
    const themeColors = {
      default: {
        walls: '#f5f5f5',
        floor: '#8b5a2b',
        furniture: '#a67c52'
      },
      cozy: {
        walls: '#ffe8d6',
        floor: '#9e6240',
        furniture: '#b08968'
      },
      modern: {
        walls: '#ffffff',
        floor: '#303030',
        furniture: '#505050'
      },
      nature: {
        walls: '#e8f5e9',
        floor: '#795548',
        furniture: '#8d6e63'
      },
      dark: {
        walls: '#263238',
        floor: '#212121',
        furniture: '#424242'
      }
    };
    
    // 테마 색상 적용
    const colors = themeColors[theme as RoomTheme] || themeColors.default;
    
    scene.traverse((object) => {
      if (object.isMesh) {
        const mesh = object as THREE.Mesh;
        if (object.name.includes('wall')) {
          (mesh.material as THREE.Material).color.set(colors.walls);
        } else if (object.name.includes('floor')) {
          (mesh.material as THREE.Material).color.set(colors.floor);
        } else if (object.name.includes('furniture') || object.name.includes('desk') || object.name.includes('chair')) {
          (mesh.material as THREE.Material).color.set(colors.furniture);
        }
      }
    });
  }, [scene, theme]);
  
  // 벽난로 효과
  useEffect(() => {
    const fireplace = scene.getObjectByName('fireplace');
    if (fireplace) {
      fireplace.visible = hasFireplace;
      
      if (hasFireplace && actions.fireAnimation) {
        actions.fireAnimation.play();
      } else if (actions.fireAnimation) {
        actions.fireAnimation.stop();
      }
    }
  }, [scene, hasFireplace, actions]);
  
  // 날씨 효과
  useEffect(() => {
    const rain = scene.getObjectByName('rain_particles');
    const snow = scene.getObjectByName('snow_particles');
    
    if (rain) rain.visible = weatherType === 'rainy';
    if (snow) snow.visible = weatherType === 'snowy';
    
    if (weatherType === 'rainy' && actions.rainAnimation) {
      actions.rainAnimation.play();
    } else if (actions.rainAnimation) {
      actions.rainAnimation.stop();
    }
    
    if (weatherType === 'snowy' && actions.snowAnimation) {
      actions.snowAnimation.play();
    } else if (actions.snowAnimation) {
      actions.snowAnimation.stop();
    }
  }, [scene, weatherType, actions]);
  
  // 모바일 최적화
  useEffect(() => {
    if (shouldUseSimplifiedGeometry) {
      scene.traverse((object) => {
        if (object.isMesh) {
          const mesh = object as THREE.Mesh;
          // 모바일에서는 그림자 비활성화
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          
          // 낮은 해상도 텍스처 사용
          if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).map) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            if (material.map) {
              material.map.minFilter = THREE.NearestFilter;
              material.map.magFilter = THREE.NearestFilter;
            }
          }
        }
      });
    }
  }, [scene, shouldUseSimplifiedGeometry]);
  
  return <primitive object={scene} />;
  */
}

// 메인 3D 스터디룸 컴포넌트
interface StudyRoomProps {
  timeOfDay?: 'day' | 'night';
  weatherType?: 'clear' | 'rainy' | 'snowy';
  hasFireplace?: boolean;
  theme?: RoomTheme;
}

export default function StudyRoom({ 
  timeOfDay = 'day', 
  weatherType = 'clear',
  hasFireplace = true,
  theme = 'default'
}: StudyRoomProps) {
  const { isMobile, shouldUseSimplifiedGeometry } = useOptimization();
  const gpuTier = useDetectGPU();
  
  // 성능에 따른 설정 조정
  const pixelRatio = isMobile ? 1 : window.devicePixelRatio;
  const shadowMapSize = gpuTier.tier < 2 ? 1024 : 2048;
  
  return (
    <div className="study-room-container">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 50 }}
        shadows={!isMobile}
        dpr={pixelRatio}
        performance={{ min: 0.5 }}
      >
        {/* 환경 조명 */}
        <Environment
          preset={timeOfDay === 'day' ? 'sunset' : 'night'}
          background={!shouldUseSimplifiedGeometry}
        />
        
        {/* 주변광 */}
        <ambientLight 
          intensity={timeOfDay === 'day' ? 0.8 : 0.3} 
          color={timeOfDay === 'day' ? '#ffffff' : '#2a2a5a'} 
        />
        
        {/* 주 조명 */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={timeOfDay === 'day' ? 1 : 0.2}
          castShadow={!isMobile}
          shadow-mapSize-width={shadowMapSize}
          shadow-mapSize-height={shadowMapSize}
        />
        
        {/* 벽난로 조명 (벽난로가 켜져 있을 때) */}
        {hasFireplace && (
          <pointLight
            position={[0, 0.5, 0]}
            intensity={1.5}
            color="#ff8c23"
            distance={3}
            decay={2}
          />
        )}
        
        {/* 스터디룸 모델 */}
        <Suspense fallback={null}>
          <StudyRoomModel hasFireplace={hasFireplace} weatherType={weatherType} theme={theme} />
        </Suspense>
        
        {/* 카메라 컨트롤 */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
