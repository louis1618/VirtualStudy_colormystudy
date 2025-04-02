"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const username = session?.user?.name || '';

  return (
    <nav className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold dark:text-white">
          Virtual Study Room
        </Link>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {isLoggedIn ? (
            <>
              <Link href={`/room/${username}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                내 스터디룸
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
                프로필
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
                로그인
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
