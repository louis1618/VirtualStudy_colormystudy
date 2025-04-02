import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// 인증이 필요한 페이지를 위한 미들웨어 컴포넌트
export default async function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
  if (!session || !session.user) {
    redirect('/login');
  }
  
  return <>{children}</>;
}
