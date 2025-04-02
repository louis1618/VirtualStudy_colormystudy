"use client";

import { useState, useEffect } from 'react';
import { FiTarget, FiCheck, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';

type GoalTrackerProps = {
  userId: string;
};

export default function GoalTracker({ userId }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Array<{id: string; text: string; completed: boolean}>>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  // 목표 불러오기
  useEffect(() => {
    const savedGoals = localStorage.getItem(`${userId}_goals`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // 기본 목표 설정
      const defaultGoals = [
        { id: '1', text: '이번 주 10시간 공부하기', completed: false },
        { id: '2', text: '프로젝트 완성하기', completed: false },
      ];
      setGoals(defaultGoals);
      localStorage.setItem(`${userId}_goals`, JSON.stringify(defaultGoals));
    }
  }, [userId]);
  
  // 목표 저장
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem(`${userId}_goals`, JSON.stringify(goals));
    }
  }, [goals, userId]);
  
  // 목표 추가
  const addGoal = () => {
    if (newGoal.trim() === '') return;
    
    const newGoalItem = {
      id: Date.now().toString(),
      text: newGoal,
      completed: false,
    };
    
    setGoals([...goals, newGoalItem]);
    setNewGoal('');
  };
  
  // 목표 완료 토글
  const toggleGoal = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };
  
  // 목표 삭제
  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };
  
  // 목표 편집 시작
  const startEdit = (id: string, text: string) => {
    setIsEditing(id);
    setEditText(text);
  };
  
  // 목표 편집 저장
  const saveEdit = () => {
    if (editText.trim() === '' || !isEditing) return;
    
    setGoals(
      goals.map((goal) =>
        goal.id === isEditing ? { ...goal, text: editText } : goal
      )
    );
    
    setIsEditing(null);
    setEditText('');
  };
  
  // 목표 달성률 계산
  const completionRate = goals.length > 0
    ? Math.round((goals.filter(goal => goal.completed).length / goals.length) * 100)
    : 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          <FiTarget className="inline-block mr-2" />
          목표 관리
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          달성률: <span className="font-bold text-blue-600 dark:text-blue-400">{completionRate}%</span>
        </div>
      </div>
      
      {/* 목표 추가 폼 */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="새 목표 추가..."
          className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded-l-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
        />
        <button
          onClick={addGoal}
          className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
          aria-label="목표 추가"
        >
          <FiPlus />
        </button>
      </div>
      
      {/* 목표 목록 */}
      <ul className="space-y-2">
        {goals.map((goal) => (
          <li
            key={goal.id}
            className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            {isEditing === goal.id ? (
              <div className="flex flex-grow">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-grow p-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="ml-2 p-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  aria-label="저장"
                >
                  <FiCheck />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => toggleGoal(goal.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span
                    className={`ml-2 ${
                      goal.completed
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {goal.text}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEdit(goal.id, goal.text)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    aria-label="편집"
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    aria-label="삭제"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        
        {goals.length === 0 && (
          <li className="text-center text-gray-500 dark:text-gray-400 py-4">
            목표가 없습니다. 새 목표를 추가해보세요!
          </li>
        )}
      </ul>
    </div>
  );
}
