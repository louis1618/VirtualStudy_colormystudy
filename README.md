# Virtual Study Room 프로젝트 문서

## 프로젝트 개요
Virtual Study Room은 사용자들이 자신만의 3D 스터디룸을 만들고, 목표와 공부한 시간을 공유할 수 있는 웹 애플리케이션입니다. 경쟁 요소를 최소화하고 편안한 분위기에서 공부할 수 있는 환경을 제공합니다.

## 주요 기능
1. **3D 스터디룸**: Three.js와 React Three Fiber를 활용한 커스터마이징 가능한 3D 환경
2. **목표 및 공부 시간 공유**: 사용자가 목표를 설정하고 공부 시간을 기록할 수 있는 기능
3. **사용자별 방 생성 및 공유**: 각 사용자의 고유한 URL 제공 및 방 공유 기능
4. **음악 및 타이머**: 집중을 돕는 배경 음악 재생 및 포모도로 타이머 기능
5. **계정 시스템**: 사용자 인증 및 데이터 저장 기능

## 기술 스택
- **프론트엔드**: Next.js, React, TypeScript, Tailwind CSS
- **3D 렌더링**: Three.js, React Three Fiber, Drei
- **상태 관리**: React Context API
- **인증**: NextAuth.js
- **스타일링**: Tailwind CSS, Framer Motion
- **음악 재생**: Howler.js
- **실시간 통신**: Socket.io

## 프로젝트 구조
```
virtual-study-room-project/
├── src/
│   ├── app/                    # Next.js 앱 라우터
│   │   ├── api/                # API 라우트
│   │   ├── login/              # 로그인 페이지
│   │   ├── signup/             # 회원가입 페이지
│   │   ├── profile/            # 프로필 페이지
│   │   ├── room/[username]/    # 사용자별 스터디룸 페이지
│   │   ├── layout.tsx          # 레이아웃 컴포넌트
│   │   ├── page.tsx            # 홈페이지
│   │   └── globals.css         # 전역 스타일
│   ├── components/             # 컴포넌트
│   │   ├── 3d/                 # 3D 관련 컴포넌트
│   │   ├── auth/               # 인증 관련 컴포넌트
│   │   ├── goals/              # 목표 관련 컴포넌트
│   │   ├── music/              # 음악 관련 컴포넌트
│   │   ├── timer/              # 타이머 관련 컴포넌트
│   │   └── ui/                 # UI 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   ├── lib/                    # 유틸리티 함수
│   ├── types/                  # 타입 정의
│   └── utils/                  # 유틸리티 함수
├── public/                     # 정적 파일
├── next.config.js              # Next.js 설정
├── tailwind.config.js          # Tailwind CSS 설정
├── tsconfig.json               # TypeScript 설정
└── package.json                # 프로젝트 의존성
```

## 주요 컴포넌트 설명

### 3D 스터디룸
- `StudyRoom.tsx`: 메인 3D 스터디룸 컴포넌트
- `RoomControls.tsx`: 스터디룸 설정 컨트롤 컴포넌트
- `Fireplace.tsx`: 벽난로 효과 컴포넌트

### 목표 및 타이머
- `GoalTracker.tsx`: 목표 설정 및 관리 컴포넌트
- `StudyTimeTracker.tsx`: 공부 시간 추적 컴포넌트
- `Timer.tsx`: 포모도로 타이머 컴포넌트

### 음악 플레이어
- `MusicPlayer.tsx`: 배경 음악 재생 컴포넌트

### 인증 시스템
- `AuthProvider.tsx`: 인증 상태 관리 컴포넌트
- `AuthGuard.tsx`: 인증 상태에 따른 접근 제어 컴포넌트

### UI 컴포넌트
- `Navbar.tsx`: 네비게이션 바 컴포넌트
- `RoomThemeCustomizer.tsx`: 방 테마 커스터마이징 컴포넌트
- `RoomSharing.tsx`: 방 공유 컴포넌트
- `ThemeToggle.tsx`: 다크/라이트 모드 토글 컴포넌트

## 최적화 및 접근성
- 모바일 디바이스 감지 및 최적화
- 3D 렌더링 최적화 (Frustum Culling, LOD)
- 다크 모드 지원
- 반응형 디자인

## 로컬에서 실행하기
1. 저장소 클론
```bash
git clone <repository-url>
cd virtual-study-room-project
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 브라우저에서 확인
```
http://localhost:3000
```

## 배포 방법
### Vercel을 통한 배포 (권장)
1. [Vercel](https://vercel.com)에 가입하고 GitHub 계정 연결
2. 프로젝트 저장소 가져오기
3. 기본 설정으로 배포 진행

### 정적 내보내기 (API 라우트 제외)
API 라우트를 사용하지 않는 경우에만 사용 가능합니다.

1. next.config.js 파일에 다음 설정 추가:
```js
module.exports = {
  output: 'export',
  // 기타 설정...
}
```

2. 빌드 실행
```bash
npm run build
```

3. 생성된 `out` 디렉토리를 정적 호스팅 서비스에 업로드

## 알려진 이슈 및 제한사항
- 정적 내보내기 모드에서는 API 라우트가 작동하지 않아 인증 기능이 제한됩니다.
- 3D 렌더링은 디바이스 성능에 따라 다를 수 있습니다.
- 일부 브라우저에서는 WebGL 지원이 제한적일 수 있습니다.

## 향후 개선 사항
- 사용자 튜토리얼 추가
- 더 다양한 방 테마 및 가구 옵션 제공
- 공부 통계 및 분석 기능 강화
- 모바일 앱 버전 개발
