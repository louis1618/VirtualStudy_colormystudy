import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Virtual Study Room</h1>
        
        <div className="bg-white/30 p-8 rounded-lg backdrop-blur-sm">
          <p className="text-lg mb-6">
            나만의 3D 스터디룸에서 공부하고 목표를 공유하세요. 편안한 분위기에서 집중력을 높이고 
            공부 시간을 기록할 수 있습니다.
          </p>
          
          <div className="flex flex-col space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">주요 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/20 rounded-lg">
                <h3 className="text-xl font-medium">🏠 3D 스터디룸</h3>
                <p>Three.js로 구현된 커스터마이징 가능한 3D 공간</p>
              </div>
              <div className="p-4 bg-white/20 rounded-lg">
                <h3 className="text-xl font-medium">🎯 목표 & 공부 시간 공유</h3>
                <p>개인 목표를 설정하고 공부 시간을 기록하세요</p>
              </div>
              <div className="p-4 bg-white/20 rounded-lg">
                <h3 className="text-xl font-medium">🔗 방 공유</h3>
                <p>나만의 고유한 URL로 스터디룸을 공유하세요</p>
              </div>
              <div className="p-4 bg-white/20 rounded-lg">
                <h3 className="text-xl font-medium">🎵 음악 & 타이머</h3>
                <p>집중을 돕는 음악과 효율적인 타이머 기능</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link 
              href="/login" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그인
            </Link>
            <Link 
              href="/signup" 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
