"use client";

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white/80 bg-gray-900/90 backdrop-blur-md shadow-sm py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white">
          Color My Study
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link href={`/s`} className="text-blue-600 hover:text-blue-800 :text-blue-400 :hover:text-blue-300">
                내 스터디룸
              </Link>
        </div>
      </div>
    </nav>
  );
}
