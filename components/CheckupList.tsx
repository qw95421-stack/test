import React, { useState } from 'react';
import { CheckupEntry } from '../types';
import { PlusIcon, TrashIcon, CheckCircleIcon } from './Icons';

interface CheckupListProps {
  entries: CheckupEntry[];
  onAddEntry: (entry: Omit<CheckupEntry, 'id'>) => void;
  onToggleEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
}

const CheckupList: React.FC<CheckupListProps> = ({ entries, onAddEntry, onToggleEntry, onDeleteEntry }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && location) {
      onAddEntry({
        date,
        location,
        notes,
        completed: false
      });
      setDate('');
      setLocation('');
      setNotes('');
      setIsAdding(false);
    }
  };

  const upcoming = entries.filter(e => !e.completed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = entries.filter(e => e.completed).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
        
      {!isAdding ? (
         <button 
            onClick={() => setIsAdding(true)}
            className="w-full bg-rose-500 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
         >
            <PlusIcon /> 新增產檢
         </button>
      ) : (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4">新增產檢行程</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">日期與時間</label>
                      <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200 text-gray-900" />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">醫生 / 醫院</label>
                      <input type="text" required placeholder="例如：李醫師 / 臺大醫院" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200 text-gray-900 placeholder-gray-400" />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">備註 (選填)</label>
                      <textarea placeholder="例如：記得帶健保卡、超音波照片..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200 h-24 resize-none text-gray-900 placeholder-gray-400" />
                  </div>
                  <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 text-gray-500 font-medium">取消</button>
                      <button type="submit" className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800">儲存</button>
                  </div>
              </form>
          </div>
      )}

      <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide ml-2 mb-3">即將到來</h3>
          {upcoming.length === 0 ? (
              <p className="text-gray-400 text-sm ml-2">尚無即將到來的產檢。</p>
          ) : (
              <div className="space-y-3">
                  {upcoming.map(entry => (
                      <div key={entry.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-rose-400 flex justify-between items-start">
                          <div className="flex-1">
                              <p className="font-bold text-gray-800 text-lg">{new Date(entry.date).toLocaleDateString(undefined, {weekday: 'short', month: 'numeric', day: 'numeric'})}</p>
                              <p className="text-sm text-gray-500 mb-2">{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {entry.location}</p>
                              {entry.notes && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg mt-2 inline-block max-w-full">{entry.notes}</p>}
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button onClick={() => onToggleEntry(entry.id)} className="text-rose-200 hover:text-rose-500 transition-colors">
                                <CheckCircleIcon checked={false} className="w-8 h-8" />
                            </button>
                            <button onClick={() => onDeleteEntry(entry.id)} className="text-gray-200 hover:text-gray-400 transition-colors">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {past.length > 0 && (
        <div className="opacity-70">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide ml-2 mb-3">已完成</h3>
            <div className="space-y-3">
                {past.map(entry => (
                    <div key={entry.id} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100">
                         <div>
                            <p className="font-semibold text-gray-600 line-through decoration-gray-400">{new Date(entry.date).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400">{entry.location}</p>
                        </div>
                         <div className="flex items-center gap-3">
                             <button onClick={() => onToggleEntry(entry.id)} className="text-green-500">
                                <CheckCircleIcon checked={true} />
                            </button>
                             <button onClick={() => onDeleteEntry(entry.id)} className="text-gray-300 hover:text-gray-500">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                         </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default CheckupList;