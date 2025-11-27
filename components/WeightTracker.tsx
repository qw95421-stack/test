import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { WeightEntry, UserProfile } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface WeightTrackerProps {
  entries: WeightEntry[];
  onAddEntry: (weight: number) => void;
  onDeleteEntry: (id: string) => void;
  userProfile: UserProfile;
}

const WeightTracker: React.FC<WeightTrackerProps> = ({ entries, onAddEntry, onDeleteEntry, userProfile }) => {
  const [newWeight, setNewWeight] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeight && !isNaN(parseFloat(newWeight))) {
      onAddEntry(parseFloat(newWeight));
      setNewWeight('');
    }
  };

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Format data for chart
  const chartData = sortedEntries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
    weight: entry.weight
  }));

  const latestWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weight : userProfile.prePregnancyWeight || 0;
  const weightGain = userProfile.prePregnancyWeight ? (latestWeight - userProfile.prePregnancyWeight).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">體重概覽</h2>
        <div className="flex justify-between items-center mb-6">
            <div>
                <p className="text-sm text-gray-500">目前體重</p>
                <p className="text-2xl font-bold text-gray-800">{latestWeight} kg</p>
            </div>
            {userProfile.prePregnancyWeight && (
                <div className="text-right">
                    <p className="text-sm text-gray-500">總增重</p>
                    <p className={`text-2xl font-bold ${Number(weightGain) > 0 ? 'text-rose-500' : 'text-gray-800'}`}>
                        {Number(weightGain) > 0 ? '+' : ''}{weightGain} kg
                    </p>
                </div>
            )}
        </div>

        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#ec4899', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#ec4899" strokeWidth={3} dot={{r: 4, fill: '#ec4899', strokeWidth: 0}} activeDot={{r: 6}} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-md font-semibold text-gray-700 mb-4">記錄體重</h3>
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
                type="number" 
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="例如: 65.5"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-200 transition-all text-gray-900 placeholder-gray-400"
            />
            <button 
                type="submit"
                disabled={!newWeight}
                className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                <PlusIcon />
            </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide ml-2">歷史紀錄</h3>
        {[...sortedEntries].reverse().map((entry) => (
            <div key={entry.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm border border-gray-50">
                <div>
                    <p className="font-semibold text-gray-800">{entry.weight} kg</p>
                    <p className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString()} • {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <button 
                    onClick={() => onDeleteEntry(entry.id)}
                    className="text-gray-300 hover:text-red-400 p-2 transition-colors"
                >
                    <TrashIcon />
                </button>
            </div>
        ))}
        {entries.length === 0 && <p className="text-center text-gray-400 text-sm py-4">尚無紀錄。</p>}
      </div>
    </div>
  );
};

export default WeightTracker;