"use client";

import { useState } from 'react';

type BreakEndModalProps = {
  isOpen: boolean;
  onContinue: (minutes: number, addToExisting: boolean) => void;
  onCancel: () => void;
  defaultMinutes?: number;
};

export default function BreakEndModal({ 
  isOpen, 
  onContinue, 
  onCancel,
  defaultMinutes = 60
}: BreakEndModalProps) {
  const [studyMinutes, setStudyMinutes] = useState(defaultMinutes);
  const addToExisting = true;
  
  if (!isOpen) return null;

  const handleContinue = () => {
    onContinue(studyMinutes, addToExisting);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black border border-white/20 rounded-2xl p-8 max-w-md w-full animate-fadeIn">
        <h2 className="block text-2xl text-white font-medium mb-6">휴식 시간이 끝났습니다</h2>
        
        <div className="mb-6">
          <label htmlFor="study-minutes" className="block text-sm font-medium text-gray-400 mb-2">
            얼마나 더 공부하시겠습니까?
          </label>
          <div className="flex items-center">
            <input
              id="study-minutes"
              type="number"
              min="1"
              max="180"
              value={studyMinutes}
              onChange={(e) => setStudyMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#7bbfcf] focus:border-[#7bbfcf] transition-all"
            />
          </div>
          
          <div className="flex gap-2 mt-4">
            {[15, 30, 45, 60, 90, 120].map(min => (
              <button
                key={min}
                onClick={() => setStudyMinutes(min)}
                className={`px-3 py-1 rounded-md text-sm transition-all ${
                  studyMinutes === min 
                    ? 'bg-[#7bbfcf]/30 text-[#7bbfcf]' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {min}분
              </button>
            ))}
          </div>
          
          <div className="mt-6">
            <div className="text-sm text-gray-300">
              기존 공부 시간이 유지되며 계속 진행됩니다.
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-all"
          >
            취소
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 py-3 px-4 bg-[#7bbfcf]/20 hover:bg-[#7bbfcf]/30 text-[#7bbfcf] rounded-xl transition-all"
          >
            계속 공부하기
          </button>
        </div>
      </div>
    </div>
  );
}
