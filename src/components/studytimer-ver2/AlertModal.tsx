"use client";

import { useState } from 'react';
import { FiClock, FiCoffee, FiCheck } from 'react-icons/fi';

type AlertModalProps = {
  isOpen: boolean;
  onExtend: (minutes: number, resetStartTime?: boolean) => void;
  onBreak: (minutes: number) => void;
  onFinish: () => void;
  defaultExtendMinutes?: number;
  defaultBreakMinutes?: number;
};

export default function AlertModal({ 
  isOpen, 
  onExtend, 
  onBreak, 
  onFinish,
  defaultExtendMinutes = 15,
  defaultBreakMinutes = 5
}: AlertModalProps) {
  const [extendMinutes, setExtendMinutes] = useState(defaultExtendMinutes);
  const [breakMinutes, setBreakMinutes] = useState(defaultBreakMinutes);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-2">시간이 종료되었습니다</h2>
        <p className="text-gray-400 mb-6">다음 중 하나를 선택하세요.</p>
        
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <FiClock className="mr-2" /> 시간 연장하기
            </h3>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <select
                  value={extendMinutes}
                  onChange={(e) => setExtendMinutes(Number(e.target.value))}
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value={5}>5분</option>
                  <option value={10}>10분</option>
                  <option value={15}>15분</option>
                  <option value={30}>30분</option>
                  <option value={60}>1시간</option>
                </select>
                <button
                  onClick={() => onExtend(extendMinutes, false)}
                  className="ml-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  연장하기
                </button>
              </div>
              
              <div className="text-sm text-gray-400 mt-2">
                공부한 시간이 유지되며 계속 진행됩니다.
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <FiCoffee className="mr-2" /> 휴식 취하기
            </h3>
            <div className="flex items-center">
              <select
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value={5}>5분</option>
                <option value={10}>10분</option>
                <option value={15}>15분</option>
                <option value={30}>30분</option>
              </select>
              <button
                onClick={() => onBreak(breakMinutes)}
                className="ml-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                휴식하기
              </button>
            </div>
            <div className="text-sm text-gray-400 mt-2">
              휴식 후에도 공부한 시간이 유지됩니다.
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={onFinish}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <FiCheck className="mr-2" /> 공부 종료하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
