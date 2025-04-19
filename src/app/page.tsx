import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ weight: ['400', '700'], subsets: ['latin'] });

export default function Home() {
  return (
    <div className={poppins.className}>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold mb-4 text-center">개인 스터디룸</h1>

          <div className="bg-white/30 p-8 rounded-lg backdrop-blur-sm">
            <p className="text-center text-lg mb-8">
              나만의 스터디룸에서 집중력을 높이고, 목표를 달성하세요!
            </p>

            <div className="flex flex-col space-y-4 mb-8">
              <h2 className="text-2xl font-semibold">주요 기능</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/20 rounded-lg">
                  <h3 className="text-xl font-medium">🏠 시간 효율 향상</h3>
                  <p>미리 공부할 시간을 정해두고 공부하세요!</p>
                </div>
                <div className="p-4 bg-white/20 rounded-lg">
                  <h3 className="text-xl font-medium">🎵 음악 & 타이머</h3>
                  <p>집중을 돕는 음악과 효율적인 타이머 기능</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Link
                href="/s"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                공부하러 가기
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}