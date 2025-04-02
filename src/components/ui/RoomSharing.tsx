"use client";

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiShare2, FiCopy, FiTwitter, FiFacebook } from 'react-icons/fi';

export default function RoomSharing({ username }) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const roomUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${username}` : '';
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomUrl)
      .then(() => {
        alert('URL이 클립보드에 복사되었습니다!');
      })
      .catch((err) => {
        console.error('클립보드 복사 실패:', err);
      });
  };
  
  const shareOnTwitter = () => {
    const text = `${username}의 Virtual Study Room에서 함께 공부해요! 👩‍💻👨‍💻`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(roomUrl)}`;
    window.open(url, '_blank');
  };
  
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(roomUrl)}`;
    window.open(url, '_blank');
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">내 스터디룸 공유하기</h3>
        <button
          onClick={() => setShowShareOptions(!showShareOptions)}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <FiShare2 className="mr-1" />
          {showShareOptions ? '닫기' : '공유하기'}
        </button>
      </div>
      
      {showShareOptions && (
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <QRCodeSVG value={roomUrl} size={150} />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">QR 코드로 스터디룸 공유</p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
              <input
                type="text"
                value={roomUrl}
                readOnly
                className="bg-transparent flex-grow text-sm text-gray-700 dark:text-gray-300 outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="ml-2 p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                aria-label="URL 복사"
              >
                <FiCopy />
              </button>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={shareOnTwitter}
                className="p-2 text-blue-400 hover:text-blue-600"
                aria-label="트위터에 공유"
              >
                <FiTwitter size={24} />
              </button>
              <button
                onClick={shareOnFacebook}
                className="p-2 text-blue-600 hover:text-blue-800"
                aria-label="페이스북에 공유"
              >
                <FiFacebook size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
