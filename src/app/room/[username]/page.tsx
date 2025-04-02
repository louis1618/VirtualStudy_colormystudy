import StudyRoomClient from './StudyRoomClient';

// 서버 컴포넌트인 페이지
export default async function Page({ params }: { params: { username: string } }) {
  return (
    <StudyRoomClient username={params.username} />
  );
}
