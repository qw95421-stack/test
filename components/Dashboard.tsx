import React from 'react';
import { UserProfile } from '../types';
import { EditIcon } from './Icons';

interface DashboardProps {
  userProfile: UserProfile;
  onEditProfile: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onEditProfile }) => {
  // Normalize to midnight local time for accurate day calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse YYYY-MM-DD string to local date
  const [y, m, d] = userProfile.dueDate.split('-').map(Number);
  const dueDate = new Date(y, m - 1, d);
  dueDate.setHours(0, 0, 0, 0);
  
  // Calculate difference in time
  const timeDiff = dueDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Calculate current week
  // Typical pregnancy is 280 days (40 weeks)
  const totalDays = 280;
  const daysPassed = totalDays - daysRemaining;
  
  // Calculate LMP (Start Date) based on 280 days rule
  const lmpDate = new Date(dueDate);
  lmpDate.setDate(dueDate.getDate() - 280);

  // Ensure non-negative and handle post-term
  const cleanDaysPassed = Math.max(0, daysPassed);
  
  const currentWeek = Math.floor(cleanDaysPassed / 7);
  const currentDay = cleanDaysPassed % 7;

  // Simple progress bar calculation
  const progressPercentage = Math.min(100, Math.max(0, (cleanDaysPassed / totalDays) * 100));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-pink-400 to-rose-400 rounded-3xl p-6 text-white shadow-lg shadow-pink-200 relative">
        <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold opacity-90">你好，{userProfile.name}</h2>
            <button 
                onClick={onEditProfile}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                aria-label="編輯資料"
            >
                <EditIcon className="w-4 h-4 text-white" />
            </button>
        </div>
        <div className="mt-4 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center w-40 h-40 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/40">
                <div className="text-center">
                    <span className="block text-4xl font-bold">{currentWeek}</span>
                    <span className="text-sm uppercase tracking-wider opacity-80">週</span>
                </div>
            </div>
            <p className="mt-4 text-lg font-medium">
                又 {currentDay} 天
            </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-2">
            <span className="text-gray-500 font-medium text-sm">孕期進度</span>
            <span className="text-rose-500 font-bold">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
            <div 
                className="bg-rose-400 h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
        <div className="flex justify-between mt-4">
            <div className="text-center">
                <p className="text-xs text-gray-400 uppercase">最後經期 (推算)</p>
                <p className="font-semibold text-gray-700">{lmpDate.toLocaleDateString()}</p>
            </div>
             <div className="text-center">
                <p className="text-xs text-gray-400 uppercase">預產期</p>
                <p className="font-semibold text-gray-700">{dueDate.toLocaleDateString()}</p>
            </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-blue-800 font-semibold mb-2">倒數天數</h3>
          <p className="text-3xl font-bold text-blue-600">{daysRemaining > 0 ? daysRemaining : 0}</p>
          <p className="text-sm text-blue-400 mt-1">媽咪，妳做得很好！</p>
      </div>
    </div>
  );
};

export default Dashboard;