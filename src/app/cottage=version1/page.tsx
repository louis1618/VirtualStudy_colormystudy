import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import VirtualCottageClient from './VirtualCottageClient';

// 서버 컴포넌트에서는 클라이언트 컴포넌트를 로드
export default function VirtualCottagePage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-xl text-center px-4">Virtual Cottage 로딩 중...</p>
        </div>
      </div>
    }>
      <VirtualCottageClient />
    </Suspense>
  );
}
