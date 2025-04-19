"use client";

import { FaCat } from 'react-icons/fa';

export default function PetSelection() {
  return (
    <div className={'bg-white/10 rounded-xl p-4'}>
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1">
          <div
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-200 bg-amber-800/50`}
            aria-label="알림 메시지"
          >
            <FaCat className={`text-amber-300 mr-2`} size={18} />
            <span>잠깐! 할 일은 전부 마치셨나요?</span>
          </div>
        </div>
      </div>
    </div>
  );
}