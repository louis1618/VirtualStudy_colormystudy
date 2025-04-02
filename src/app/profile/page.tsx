import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await getServerSession();
  
  // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
  if (!session || !session.user) {
    redirect('/login');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6">내 프로필</h1>
          
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
                {session.user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{session.user.name}</h2>
                <p className="text-gray-600">{session.user.email}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium mb-3">내 스터디룸</h3>
              <Link 
                href={`/room/${session.user.name}`} 
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                스터디룸으로 이동
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">계정 설정</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="study-goal" className="block text-sm font-medium text-gray-700 mb-1">
                  공부 목표
                </label>
                <input
                  type="text"
                  id="study-goal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="예: 이번 주 10시간 공부하기"
                  defaultValue=""
                />
              </div>
              
              <div>
                <label htmlFor="room-theme" className="block text-sm font-medium text-gray-700 mb-1">
                  방 테마
                </label>
                <select
                  id="room-theme"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  defaultValue="default"
                >
                  <option value="default">기본 테마</option>
                  <option value="cozy">아늑한 테마</option>
                  <option value="modern">모던 테마</option>
                  <option value="nature">자연 테마</option>
                </select>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  설정 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
