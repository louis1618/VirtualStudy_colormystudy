"use client";

import { useState } from 'react';
import { FiPlus, FiCheck, FiTrash, FiX } from 'react-icons/fi';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    
    const todo: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false
    };
    
    setTodos([...todos, todo]);
    setNewTodo('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">할 일 목록</h2>
      </div>
      
      <div className="flex items-center bg-white/10 rounded-lg overflow-hidden mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="새 할 일 추가..."
          className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-white/50 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          className="px-3 py-3 text-white/80 hover:text-white"
          aria-label="할 일 추가"
        >
          <FiPlus size={18} />
        </button>
      </div>
      
      {todos.length > 0 ? (
        <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {todos.map(todo => (
            <li 
              key={todo.id} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                todo.completed ? 'bg-white/5' : 'bg-white/10'
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center border ${
                  todo.completed 
                    ? 'bg-white/20 border-white/50' 
                    : 'bg-transparent border-white/30'
                }`}
                aria-label={todo.completed ? "할 일 완료 취소" : "할 일 완료"}
              >
                {todo.completed && <FiCheck size={14} className="text-white" />}
              </button>
              
              <span className={`text-sm flex-1 text-white ${
                todo.completed ? 'line-through opacity-50' : ''
              }`}>
                {todo.text}
              </span>
              
              <button
                onClick={() => deleteTodo(todo.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/10"
                aria-label="할 일 삭제"
              >
                <FiTrash size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 text-white/50">
          <p>할 일이 없습니다</p>
          <p className="text-sm mt-1">새로운 할 일을 추가해보세요</p>
        </div>
      )}
    </div>
  );
}
