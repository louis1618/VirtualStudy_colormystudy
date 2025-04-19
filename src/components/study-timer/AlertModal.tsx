"use client";

import { useState, useEffect } from 'react';

type AlertModalProps = {
  isOpen: boolean;
  onExtend: () => void;
  onBreak: () => void;
  onFinish: () => void;
};

export default function AlertModal({ isOpen, onExtend, onBreak, onFinish }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black border border-white/20 rounded-2xl p-8 max-w-md w-full animate-fadeIn">
        <h2 className="block text-2xl text-white font-medium mb-6">시간이 종료되었습니다</h2>
        
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={onExtend}
            className="py-3 px-4 bg-[#7bbfcf]/20 hover:bg-[#7bbfcf]/30 text-[#7bbfcf] rounded-xl transition-all"
          >
            시간 연장하기
          </button>
          
          <button
            onClick={onBreak}
            className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl transition-all"
          >
            휴식 시작하기
          </button>
          
          <button
            onClick={onFinish}
            className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-all mt-2"
          >
            종료하기
          </button>
        </div>
      </div>
    </div>
  );
}
