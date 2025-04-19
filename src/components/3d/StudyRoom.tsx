"use client";

import React, { useEffect, Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, useAnimations, Preload, AdaptiveDpr } from "@react-three/drei";
import { useDetectGPU } from "@react-three/drei";
import { useOptimization } from "@/utils/renderOptimization";
import * as THREE from "three";

// Props 타입 정의
interface StudyRoomProps {
  hasFireplace?: boolean;
  weatherType?: "clear" | "rainy" | "snowy";
  theme?: "default" | "cozy" | "modern" | "nature" | "dark";
  timeOfDay?: "day" | "night";
}

// 테마별 색상 설정
const themeColors: Record<string, { walls: string; floor: string; furniture: string }> = {
  default: { walls: "#f5f5f5", floor: "#8b5a2b", furniture: "#a67c52" },
  cozy: { walls: "#ffe8d6", floor: "#9e6240", furniture: "#b08968" },
  modern: { walls: "#ffffff", floor: "#303030", furniture: "#505050" },
  nature: { walls: "#e8f5e9", floor: "#795548", furniture: "#8d6e63" },
  dark: { walls: "#263238", floor: "#212121", furniture: "#424242" },
};

// 스터디룸 모델 컴포넌트
function StudyRoomModel({ hasFireplace = true, weatherType = "clear", theme = "default", timeOfDay = "day" }: StudyRoomProps) {
  // 모델 로드 오류 처리 추가
  const { scene, animations } = useGLTF("/models/studygirlchallenge.glb", true);
  const group = useRef<THREE.Group>(null!);
  const { actions, names, mixer } = useAnimations(animations, group);
  const { shouldUseSimplifiedGeometry } = useOptimization();
  
  // 모델 첫 로딩 상태 추적
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  // 창문 메시 참조
  const [windowMeshes, setWindowMeshes] = useState<THREE.Mesh[]>([]);
  // 날씨 효과 그룹
  const weatherEffectsRef = useRef<THREE.Group>(null!);
  
  // 모델 로드 완료 처리
  useEffect(() => {
    if (scene && !isModelLoaded) {
      console.log("3D 모델 로드 완료");
      console.log("사용 가능한 애니메이션:", names);
      
      // 창문 메시 찾기
      const windows: THREE.Mesh[] = [];
      
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          // 창문 관련 메시 찾기 - 이름에 window나 glass가 포함된 오브젝트
          if (object.name.toLowerCase().includes('window') || 
              object.name.toLowerCase().includes('glass') ||
              object.name.toLowerCase().includes('pane')) {
            windows.push(object as THREE.Mesh);
            console.log("Found window mesh:", object.name);
          }
        }
      });
      
      if (windows.length === 0) {
        // 창문이 없다면 가상 창문 생성
        console.log("가상 창문 생성");
        const windowGeometry = new THREE.PlaneGeometry(5, 5);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x87CEEB, 
          transparent: true,
          opacity: 0.8
        });
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        
        // 위로 올리고, 90도 회전시키고, 왼쪽 뒤쪽에 배치
        windowMesh.position.set(-6, 4, 2); // 위치 조정: 왼쪽(-x), 위(+y), 뒤쪽(+z)
        windowMesh.rotation.y = Math.PI / 2; // y축 기준 90도 회전
        windowMesh.name = "virtual_window";
        scene.add(windowMesh);
        
        windows.push(windowMesh);
      }
      
      setWindowMeshes(windows);
      
      // 날씨 효과 그룹 생성
      const weatherGroup = new THREE.Group();
      weatherGroup.name = "weather_effects";
      scene.add(weatherGroup);
      weatherEffectsRef.current = weatherGroup;
      
      setIsModelLoaded(true);
    }
  }, [scene, isModelLoaded, names]);

  // 창문 재질 업데이트 (날씨 반영)
  useEffect(() => {
    if (!isModelLoaded || windowMeshes.length === 0) return;
    
    // 배경 색상 결정 (날씨와 시간에 따라)
    let windowColor = new THREE.Color();
    
    if (weatherType === 'clear') {
      // 맑은 날씨
      windowColor.set(timeOfDay === 'day' ? 0x87CEEB : 0x0a1929); // 하늘색 또는 어두운 파란색
    } else if (weatherType === 'rainy') {
      // 비 오는 날씨
      windowColor.set(timeOfDay === 'day' ? 0x708090 : 0x2F4F4F); // 회색 또는 어두운 회색
    } else if (weatherType === 'snowy') {
      // 눈 오는 날씨
      windowColor.set(timeOfDay === 'day' ? 0xE8E8E8 : 0x4F4F4F); // 밝은 회색 또는 어두운 회색
    }
    
    console.log("날씨 변경:", weatherType, "시간대:", timeOfDay);
    
    // 모든 창문 메시에 색상 적용
    windowMeshes.forEach(windowMesh => {
      if (Array.isArray(windowMesh.material)) {
        windowMesh.material.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial || 
              mat instanceof THREE.MeshBasicMaterial || 
              mat instanceof THREE.MeshPhongMaterial) {
            // 원래 재질 특성 유지하며 색상만 변경
            mat.color.copy(windowColor);
            
            // 투명도 약간 증가
            mat.transparent = true;
            mat.opacity = 0.8;
            
            // 약간의 환경 매핑 추가 (유리 질감)
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.metalness = 0.2;
              mat.roughness = 0.1;
            }
          }
        });
      } else if (windowMesh.material instanceof THREE.MeshStandardMaterial || 
                windowMesh.material instanceof THREE.MeshBasicMaterial || 
                windowMesh.material instanceof THREE.MeshPhongMaterial) {
        windowMesh.material.color.copy(windowColor);
        windowMesh.material.transparent = true;
        windowMesh.material.opacity = 0.8;
        
        if (windowMesh.material instanceof THREE.MeshStandardMaterial) {
          windowMesh.material.metalness = 0.2;
          windowMesh.material.roughness = 0.1;
        }
      }
    });
    
    // 날씨 효과 업데이트
    updateWeatherEffects();
    
  }, [isModelLoaded, windowMeshes, weatherType, timeOfDay]);
  
  // 애니메이션 초기화 및 실행
  useEffect(() => {
    if (isModelLoaded && actions) {
      // 모든 애니메이션 실행 (필요한 애니메이션만 선택적으로 실행할 수도 있음)
      Object.values(actions).forEach(action => {
        if (action) {
          // 날씨 애니메이션은 날씨 타입에 따라 선택적으로 실행
          const clipName = action.getClip().name.toLowerCase();
          const isWeatherAnimation = clipName.includes('rain') || clipName.includes('snow');
          
          if (!isWeatherAnimation) {
            action.reset().play();
            action.setLoop(THREE.LoopRepeat, Infinity);
          }
        }
      });

      // 특정 애니메이션 처리
      if (hasFireplace && actions.fireAnimation) {
        actions.fireAnimation.play();
      }

      // 날씨 애니메이션은 별도로 처리
      updateWeatherAnimations();
    }

    return () => {
      // 컴포넌트 언마운트 시 애니메이션 정리
      if (mixer) {
        mixer.stopAllAction();
      }
    };
  }, [isModelLoaded, actions, hasFireplace, mixer]);
  
  // 날씨 애니메이션 업데이트
  const updateWeatherAnimations = () => {
    if (!actions) return;
    
    // 기존 날씨 애니메이션 정지
    Object.values(actions).forEach(action => {
      if (action) {
        const clipName = action.getClip().name.toLowerCase();
        if (clipName.includes('rain') || clipName.includes('snow')) {
          action.stop();
        }
      }
    });
    
    // 선택된 날씨에 맞는 애니메이션 실행
    if (weatherType === "rainy" && actions.rainAnimation) {
      console.log("비 애니메이션 시작");
      actions.rainAnimation.reset().play();
      actions.rainAnimation.setLoop(THREE.LoopRepeat, Infinity);
    }
    
    if (weatherType === "snowy" && actions.snowAnimation) {
      console.log("눈 애니메이션 시작");
      actions.snowAnimation.reset().play();
      actions.snowAnimation.setLoop(THREE.LoopRepeat, Infinity);
    }
  };
  
  // 날씨 효과 생성 및 업데이트
  const updateWeatherEffects = () => {
    if (!weatherEffectsRef.current) return;
    
    console.log("날씨 효과 업데이트:", weatherType);
    
    // 기존 효과 제거
    while (weatherEffectsRef.current.children.length > 0) {
      weatherEffectsRef.current.remove(weatherEffectsRef.current.children[0]);
    }
    
    // 날씨가 맑으면 효과 없음
    if (weatherType === 'clear') return;
    
    // 모든 창문에 대해 처리
    windowMeshes.forEach(windowMesh => {
      const boundingBox = new THREE.Box3().setFromObject(windowMesh);
      const windowSize = new THREE.Vector3();
      boundingBox.getSize(windowSize);
      
      const windowPosition = new THREE.Vector3();
      windowMesh.getWorldPosition(windowPosition);
      
      // 창문 방향 계산
      const windowNormal = new THREE.Vector3(0, 0, 1);
      windowNormal.applyQuaternion(windowMesh.quaternion);
      
      // 창문 평면에 위치시키기 위한 기준 벡터 계산
      const upVec = new THREE.Vector3(0, 1, 0);
      const rightVec = new THREE.Vector3().crossVectors(upVec, windowNormal).normalize();
      
      console.log(`창문 위치: ${windowPosition.x}, ${windowPosition.y}, ${windowPosition.z}`);
      console.log(`창문 크기: ${windowSize.x}, ${windowSize.y}, ${windowSize.z}`);
      
      // 날씨가 비인 경우
      if (weatherType === 'rainy') {
        // 빗방울 효과 만들기
        const rainGroup = new THREE.Group();
        rainGroup.name = "rain_effect";
        
        const rainMaterial = new THREE.MeshBasicMaterial({
          color: 0x89CFF0,
          transparent: true,
          opacity: 0.7
        });
        
        const dropCount = Math.min(300, Math.floor(windowSize.x * windowSize.y * 5));
        console.log(`생성할 빗방울 개수: ${dropCount}`);
        
        for (let i = 0; i < dropCount; i++) {
          // 빗방울 지오메트리 (작은 선 형태)
          const rainGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.25, 3);
          const raindrop = new THREE.Mesh(rainGeometry, rainMaterial);
          
          // 창문 평면 상의 랜덤 위치 계산
          const offsetX = (Math.random() - 0.5) * windowSize.x * 0.9;
          const offsetY = (Math.random() * windowSize.y * 0.9) - (windowSize.y * 0.1);
          
          // 창문 평면 상의 위치 계산
          const pos = new THREE.Vector3().copy(windowPosition)
            .add(rightVec.clone().multiplyScalar(offsetX))
            .add(upVec.clone().multiplyScalar(offsetY))
            .add(windowNormal.clone().multiplyScalar(0.05));
          
          raindrop.position.copy(pos);
          
          // 빗방울 기울이기 - 창문 방향에 맞게
          raindrop.lookAt(pos.clone().add(new THREE.Vector3(0.1, -1, 0)));
          
          // 애니메이션 데이터 저장
          raindrop.userData = {
            initialPos: pos.clone(),
            maxY: pos.y + (windowSize.y * 0.4),
            minY: pos.y - (windowSize.y * 0.4),
            speed: 0.04 + Math.random() * 0.05, // 속도 증가
            upVec: upVec.clone(),
            rightVec: rightVec.clone(),
            windowNormal: windowNormal.clone()
          };
          
          rainGroup.add(raindrop);
        }
        
        weatherEffectsRef.current.add(rainGroup);
      }
      // 날씨가 눈인 경우
      else if (weatherType === 'snowy') {
        // 눈송이 효과 만들기
        const snowGroup = new THREE.Group();
        snowGroup.name = "snow_effect";
        
        const snowMaterial = new THREE.MeshBasicMaterial({
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.9
        });
        
        const flakeCount = Math.min(200, Math.floor(windowSize.x * windowSize.y * 3));
        console.log(`생성할 눈송이 개수: ${flakeCount}`);
        
        for (let i = 0; i < flakeCount; i++) {
          // 눈송이 지오메트리 (작은 구체)
          const snowGeometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.03, 4, 4);
          const snowflake = new THREE.Mesh(snowGeometry, snowMaterial);
          
          // 창문 평면 상의 랜덤 위치 계산
          const offsetX = (Math.random() - 0.5) * windowSize.x * 0.9;
          const offsetY = (Math.random() * windowSize.y * 0.9) - (windowSize.y * 0.1);
          
          // 창문 평면 상의 위치 계산
          const pos = new THREE.Vector3().copy(windowPosition)
            .add(rightVec.clone().multiplyScalar(offsetX))
            .add(upVec.clone().multiplyScalar(offsetY))
            .add(windowNormal.clone().multiplyScalar(0.05));
          
          snowflake.position.copy(pos);
          
          // 애니메이션 데이터 저장
          snowflake.userData = {
            initialPos: pos.clone(),
            maxY: pos.y + (windowSize.y * 0.4),
            minY: pos.y - (windowSize.y * 0.4),
            speedY: 0.008 + Math.random() * 0.01,
            wobbleSpeed: 0.005 + Math.random() * 0.005,
            wobbleAmount: 0.01 + Math.random() * 0.02,
            wobbleOffset: Math.random() * Math.PI * 2,
            upVec: upVec.clone(),
            rightVec: rightVec.clone(),
            windowNormal: windowNormal.clone()
          };
          
          snowGroup.add(snowflake);
        }
        
        weatherEffectsRef.current.add(snowGroup);
      }
    });
  };
  
  // 날씨 효과 애니메이션
  useFrame((state, delta) => {
    if (!isModelLoaded || !weatherEffectsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // 비 효과 애니메이션
    weatherEffectsRef.current.children.forEach(group => {
      if (group.name === "rain_effect") {
        group.children.forEach(raindrop => {
          if (!(raindrop instanceof THREE.Mesh)) return;
          
          const userData = raindrop.userData;
          
          // 빗방울이 아래로 떨어짐 - 창문 방향에 맞게
          raindrop.position.sub(userData.upVec.clone().multiplyScalar(userData.speed * delta * 60));
          
          // 약간의 흔들림 추가 - 창문 방향에 맞게
          const wobble = Math.sin(time * 2 + userData.initialPos.y) * 0.002;
          raindrop.position.add(userData.rightVec.clone().multiplyScalar(wobble));
          
          // 창문 아래로 벗어나면 다시 위로
          if (raindrop.position.y < userData.minY) {
            // 초기 위치로 리셋 (y 좌표만 상단으로)
            const newPos = userData.initialPos.clone();
            // 약간의 랜덤 x 오프셋 추가
            newPos.add(userData.rightVec.clone().multiplyScalar((Math.random() - 0.5) * 0.5));
            raindrop.position.copy(newPos);
          }
        });
      } 
      else if (group.name === "snow_effect") {
        group.children.forEach(snowflake => {
          if (!(snowflake instanceof THREE.Mesh)) return;
          
          const userData = snowflake.userData;
          
          // 눈송이가 천천히 아래로 - 창문 방향에 맞게
          snowflake.position.sub(userData.upVec.clone().multiplyScalar(userData.speedY * delta * 60));
          
          // 좌우로 흔들리는 움직임 - 창문 방향에 맞게
          const wobbleX = Math.sin(time + userData.wobbleOffset) * userData.wobbleAmount;
          snowflake.position.add(userData.rightVec.clone().multiplyScalar(wobbleX * delta * 30));
          
          // 회전 추가 - 부드러운 회전을 위해 delta 사용
          snowflake.rotation.x += 0.01 * delta * 60;
          snowflake.rotation.y += 0.008 * delta * 60;
          
          // 창문 아래로 벗어나면 다시 위로
          if (snowflake.position.y < userData.minY) {
            // 초기 위치로 리셋 (y 좌표만 상단으로)
            const newPos = userData.initialPos.clone();
            // 약간의 랜덤 x 오프셋 추가
            newPos.add(userData.rightVec.clone().multiplyScalar((Math.random() - 0.5) * 0.8));
            snowflake.position.copy(newPos);
          }
        });
      }
    });
  });

  // 테마 색상 적용
  useEffect(() => {
    const colors = themeColors[theme] || themeColors.default;

    scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        
        // 기본 머티리얼이 있는지 확인
        if (mesh.material) {
          // 단일 머티리얼
          if (!Array.isArray(mesh.material) && mesh.material instanceof THREE.MeshStandardMaterial) {
            if (mesh.name.includes("wall")) mesh.material.color.set(colors.walls);
            else if (mesh.name.includes("floor")) mesh.material.color.set(colors.floor);
            else if (mesh.name.includes("furniture") || mesh.name.includes("desk") || mesh.name.includes("chair")) {
              mesh.material.color.set(colors.furniture);
            }
          } 
          // 머티리얼 배열
          else if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                if (mesh.name.includes("wall")) mat.color.set(colors.walls);
                else if (mesh.name.includes("floor")) mat.color.set(colors.floor);
                else if (mesh.name.includes("furniture") || mesh.name.includes("desk") || mesh.name.includes("chair")) {
                  mat.color.set(colors.furniture);
                }
              }
            });
          }
        }
      }
    });
  }, [scene, theme]);

  // 벽난로 효과
  useEffect(() => {
    const fireplace = scene.getObjectByName("fireplace");
    if (fireplace) {
      fireplace.visible = hasFireplace;
    }
  }, [scene, hasFireplace]);

  // 성능 최적화 추가
  useEffect(() => {
    if (scene) {
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          // 로우엔드 기기에서는 그림자 비활성화
          if (shouldUseSimplifiedGeometry) {
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            
            // 텍스처 최적화
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => {
                  if (mat instanceof THREE.MeshStandardMaterial && mat.map) {
                    mat.map.minFilter = THREE.NearestFilter;
                    mat.map.magFilter = THREE.NearestFilter;
                    mat.needsUpdate = true;
                  }
                });
              } else if (mesh.material instanceof THREE.MeshStandardMaterial && mesh.material.map) {
                mesh.material.map.minFilter = THREE.NearestFilter;
                mesh.material.map.magFilter = THREE.NearestFilter;
                mesh.material.needsUpdate = true;
              }
            }
            
            // 복잡한 메시 단순화
            if (mesh.name.includes("detail") || mesh.name.includes("particle")) {
              mesh.visible = false;
            }
          }
        }
      });
    }
  }, [scene, shouldUseSimplifiedGeometry]);

  // weatherType이 변경될 때 로그 및 애니메이션 처리 확인
  useEffect(() => {
    console.log("날씨 타입 변경:", weatherType);
    
    if (isModelLoaded) {
      // 날씨 애니메이션 업데이트
      updateWeatherAnimations();
      
      // 날씨 효과 업데이트
      if (windowMeshes.length > 0) {
        updateWeatherEffects();
      }
    }
  }, [weatherType, isModelLoaded, windowMeshes]);

  return <primitive ref={group} object={scene} />;
}

// 에러 바운더리 컴포넌트
class ErrorBoundary extends React.Component<{children: React.ReactNode, fallback: React.ReactNode}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: any, info: any) {
    console.error("3D 렌더링 오류:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 메인 3D 스터디룸 컴포넌트
export default function StudyRoom({
  timeOfDay = "day",
  weatherType = "clear",
  hasFireplace = true,
  theme = "default",
}: StudyRoomProps) {
  const { isMobile, shouldUseSimplifiedGeometry } = useOptimization();
  const gpuTier = useDetectGPU();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgColor, setBgColor] = useState<string>(timeOfDay === "night" ? "#0a1929" : "#87CEEB");

  // 시간대가 변경될 때 배경색 업데이트
  useEffect(() => {
    setBgColor(timeOfDay === "night" ? "#0a1929" : "#87CEEB");
  }, [timeOfDay]);

  // 성능에 따른 설정 조정
  const pixelRatio = isMobile ? 0.8 : Math.min(window.devicePixelRatio, 2);
  const shadowMapSize = gpuTier.tier < 2 ? 512 : 1024;
  
  // 로컬 개발 환경 감지
  const isLocalDev = typeof window !== 'undefined' && 
                     (window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1');

  return (
    <div className="w-full h-full" data-time-of-day={timeOfDay}>
      <ErrorBoundary fallback={<div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">3D 렌더링 오류가 발생했습니다</div>}>
        <Canvas 
          ref={canvasRef}
          camera={{ position: [5, 2.5, 0], fov: 45 }}
          shadows={!isMobile && gpuTier.tier >= 1} 
          dpr={pixelRatio}
          gl={{ 
            antialias: !shouldUseSimplifiedGeometry,
            powerPreference: "high-performance",
            // 로컬 환경에서 WebGL 디버깅 활성화
            ...(isLocalDev && { alpha: true })
          }}
          performance={{ min: 0.5 }}
          style={{ 
            width: "100%", 
            height: "100%", 
            background: bgColor
          }}
        >
          {/* 환경 조명 - 성능에 따라 조정 */}
          {!shouldUseSimplifiedGeometry ? (
            <Environment preset={timeOfDay === "day" ? "sunset" : "night"} background={false} />
          ) : (
            <color attach="background" args={[timeOfDay === "day" ? "#87CEEB" : "#0a1929"]} />
          )}

          {/* 주변광 */}
          <ambientLight intensity={timeOfDay === "day" ? 0.8 : 0.3} color={timeOfDay === "day" ? "#ffffff" : "#2a2a5a"} />

          {/* 주 조명 */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={timeOfDay === "day" ? 1 : 0.2}
            castShadow={!shouldUseSimplifiedGeometry}
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
          />

          {/* 벽난로 조명 */}
          {hasFireplace && <pointLight position={[0, 0.5, 0]} intensity={1.5} color="#ff8c23" distance={3} decay={2} />}

          {/* 스터디룸 모델 */}
          <Suspense fallback={null}>
            <StudyRoomModel hasFireplace={hasFireplace} weatherType={weatherType} theme={theme} timeOfDay={timeOfDay} />
            <Preload all />
          </Suspense>

          {/* 카메라 컨트롤 */}
          <OrbitControls 
            target={[0, 3.2, 0]}
            enableZoom={false} 
            enablePan={false} 
            enableRotate={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            minDistance={2} 
            maxDistance={10}
            enableDamping
            dampingFactor={0.05}
          />

          {/* 성능에 따라 해상도 조정 */}
          <AdaptiveDpr pixelated />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

// 모델 로드 오류를 방지하기 위한 사전 로드 설정
useGLTF.preload("/models/studygirlchallenge.glb");