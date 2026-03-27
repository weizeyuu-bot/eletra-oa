import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-[#2c2c2c] flex items-center justify-center p-4 font-sans" style={{ backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl flex overflow-hidden max-w-5xl w-full min-h-[600px]"
      >
        {/* Left Side: Image */}
        <div className="hidden md:block w-3/5 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" 
            alt="Collaborative Office" 
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-2/5 p-12 flex flex-col justify-center">
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[#1a3a5a] italic tracking-wider uppercase leading-tight">
              PORTAL DE ACESSO<br />
              DA TI ELETRA
            </h2>
            <div className="h-0.5 w-12 bg-gray-100 mt-4"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">用户名</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">密码</label>
                <button type="button" className="text-xs text-gray-500 hover:text-blue-600 transition-colors italic">
                  忘记密码?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={autoLogin}
                    onChange={(e) => setAutoLogin(e.target.checked)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:bg-[#555] checked:border-[#555]"
                  />
                  <svg
                    className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-sm text-gray-600 font-medium">自动登录</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#555] text-white font-medium rounded hover:bg-[#444] transition-all shadow-lg active:scale-[0.98]"
            >
              登录
            </button>
          </form>

          <div className="mt-auto pt-12 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              GLPI Copyright (C) 2015-2024 Teclib' and contributors
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
