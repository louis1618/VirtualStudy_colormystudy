"use client";

import { useRouter } from 'next/navigation';
import { FiAlertCircle } from 'react-icons/fi';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <FiAlertCircle className="text-red-500 w-16 h-16 mb-6" />
      <h1 className="text-4xl font-bold mb-4">페이지를 찾을 수 없습니다</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <button
        onClick={() => router.push('/')}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}
