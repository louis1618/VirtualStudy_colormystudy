#!/bin/bash

# 개발 서버 실행 스크립트
echo "Virtual Study Room 개발 서버 시작하기"
echo "====================================="
echo ""
echo "이 스크립트는 Virtual Study Room 프로젝트의 개발 서버를 시작합니다."
echo "브라우저에서 http://localhost:3000 으로 접속하여 확인할 수 있습니다."
echo ""

# 현재 디렉토리 확인
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# 의존성 확인 및 설치
if [ ! -d "node_modules" ]; then
  echo "의존성 패키지를 설치합니다..."
  npm install
fi

# 개발 서버 실행
echo "개발 서버를 시작합니다..."
npm run dev
