import React, { useState, useEffect } from 'react';
import { UserProfile, WeightEntry, CheckupEntry, UltrasoundEntry, AppTab } from './types';
import { BabyIcon, ScaleIcon, CalendarIcon, BrainIcon, CameraIcon } from './components/Icons';
import Dashboard from './components/Dashboard';
import WeightTracker from './components/WeightTracker';
import CheckupList from './components/CheckupList';
import GeminiAdvice from './components/GeminiAdvice';
import UltrasoundGallery from './components/UltrasoundGallery';

const App = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);
  const [checkups, setCheckups] = useState<CheckupEntry[]>([]);
  const [ultrasoundLog, setUltrasoundLog] = useState<UltrasoundEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Onboarding States
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [preWeight, setPreWeight] = useState('');

  // Load data from LocalStorage on mount
  useEffect(() => {
    const storedProfile = localStorage.getItem('mj_profile');
    const storedWeight = localStorage.getItem('mj_weight');
    const storedCheckups = localStorage.getItem('mj_checkups');
    const storedUltrasounds = localStorage.getItem('mj_ultrasounds');

    if (storedProfile) setUserProfile(JSON.parse(storedProfile));
    if (storedWeight) setWeightLog(JSON.parse(storedWeight));
    if (storedCheckups) setCheckups(JSON.parse(storedCheckups));
    if (storedUltrasounds) setUltrasoundLog(JSON.parse(storedUltrasounds));
  }, []);

  // Save effects
  useEffect(() => {
    if (userProfile) localStorage.setItem('mj_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('mj_weight', JSON.stringify(weightLog));
  }, [weightLog]);

  useEffect(() => {
    localStorage.setItem('mj_checkups', JSON.stringify(checkups));
  }, [checkups]);

  useEffect(() => {
    localStorage.setItem('mj_ultrasounds', JSON.stringify(ultrasoundLog));
  }, [ultrasoundLog]);

  // Handlers
  const handleOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && dueDate) {
      setUserProfile({
        name,
        dueDate,
        prePregnancyWeight: preWeight ? parseFloat(preWeight) : undefined
      });
      setIsEditing(false);
    }
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setName(userProfile.name);
      setDueDate(userProfile.dueDate);
      setPreWeight(userProfile.prePregnancyWeight?.toString() || '');
      setIsEditing(true);
    }
  };

  const cancelEdit = () => {
    if (userProfile) {
        setIsEditing(false);
    }
  };

  const addWeightEntry = (weight: number) => {
    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weight
    };
    setWeightLog(prev => [...prev, newEntry]);
  };

  const deleteWeightEntry = (id: string) => {
    setWeightLog(prev => prev.filter(e => e.id !== id));
  };

  const addCheckupEntry = (entry: Omit<CheckupEntry, 'id'>) => {
    const newEntry: CheckupEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setCheckups(prev => [...prev, newEntry]);
  };

  const toggleCheckup = (id: string) => {
    setCheckups(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const deleteCheckup = (id: string) => {
    setCheckups(prev => prev.filter(c => c.id !== id));
  };

  const addUltrasoundEntry = (entry: UltrasoundEntry) => {
    setUltrasoundLog(prev => [...prev, entry]);
  };

  const deleteUltrasoundEntry = (id: string) => {
    setUltrasoundLog(prev => prev.filter(e => e.id !== id));
  };

  const getCurrentWeek = () => {
    if (!userProfile) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse local date strictly to avoid UTC offset issues
    const [y, m, d] = userProfile.dueDate.split('-').map(Number);
    const dueDateObj = new Date(y, m - 1, d);
    dueDateObj.setHours(0, 0, 0, 0);
    
    const timeDiff = dueDateObj.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalDays = 280;
    const daysPassed = totalDays - daysRemaining;
    return Math.max(0, Math.floor(daysPassed / 7));
  };

  // Render Onboarding or Edit Screen
  if (!userProfile || isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 to-white">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 text-pink-500 rounded-full mb-4">
                <BabyIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{isEditing ? '編輯個人檔案' : '歡迎來到 MommyJourney'}</h1>
            <p className="text-gray-500 mt-2">{isEditing ? '更新您的預產期與基本資料' : '讓我們設定妳的個人檔案，開始記錄這段美好的旅程。'}</p>
          </div>
          
          <form onSubmit={handleOnboarding} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">您的名字</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none text-gray-900 placeholder-gray-400" placeholder="準媽咪" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">預產期</label>
              <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">懷孕前體重 (kg) <span className="text-gray-400 font-normal">(選填)</span></label>
              <input type="number" step="0.1" value={preWeight} onChange={e => setPreWeight(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none text-gray-900 placeholder-gray-400" placeholder="60.0" />
            </div>
            <div className="flex gap-3">
                {isEditing && (
                    <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors">
                        取消
                    </button>
                )}
                <button type="submit" className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-pink-200">
                {isEditing ? '儲存變更' : '開始記錄'}
                </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50/50 pb-24 md:pb-10 max-w-2xl mx-auto border-x border-pink-100 shadow-2xl shadow-pink-100/50 relative">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 border-b border-pink-100 flex justify-between items-center">
        <h1 className="text-xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="text-pink-500">Mommy</span>Journey
        </h1>
        <div className="text-xs font-semibold bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
            第 {getCurrentWeek()} 週
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === AppTab.DASHBOARD && (
            <Dashboard userProfile={userProfile} onEditProfile={handleEditProfile} />
        )}
        {activeTab === AppTab.WEIGHT && (
          <WeightTracker 
            entries={weightLog} 
            onAddEntry={addWeightEntry} 
            onDeleteEntry={deleteWeightEntry}
            userProfile={userProfile}
          />
        )}
        {activeTab === AppTab.CHECKUPS && (
          <CheckupList 
            entries={checkups}
            onAddEntry={addCheckupEntry}
            onToggleEntry={toggleCheckup}
            onDeleteEntry={deleteCheckup}
          />
        )}
        {activeTab === AppTab.ADVICE && <GeminiAdvice currentWeek={getCurrentWeek()} />}
        {activeTab === AppTab.ULTRASOUND && (
          <UltrasoundGallery 
            entries={ultrasoundLog}
            currentWeek={getCurrentWeek()}
            onAddEntry={addUltrasoundEntry}
            onDeleteEntry={deleteUltrasoundEntry}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 w-full md:w-[90%] max-w-xl bg-white md:rounded-full border-t md:border border-gray-100 shadow-lg z-50 px-4 py-3 flex justify-between items-center text-xs font-medium text-gray-400">
        
        <button 
            onClick={() => setActiveTab(AppTab.DASHBOARD)}
            className={`flex flex-col items-center gap-1 transition-colors w-14 ${activeTab === AppTab.DASHBOARD ? 'text-pink-500' : 'hover:text-gray-600'}`}
        >
            <BabyIcon className={activeTab === AppTab.DASHBOARD ? 'fill-pink-100' : ''} />
            首頁
        </button>

        <button 
            onClick={() => setActiveTab(AppTab.WEIGHT)}
            className={`flex flex-col items-center gap-1 transition-colors w-14 ${activeTab === AppTab.WEIGHT ? 'text-pink-500' : 'hover:text-gray-600'}`}
        >
            <ScaleIcon className={activeTab === AppTab.WEIGHT ? 'fill-pink-100' : ''} />
            體重
        </button>

        <div className="relative -top-6">
            <button 
                onClick={() => setActiveTab(AppTab.ULTRASOUND)}
                className={`flex items-center justify-center w-16 h-16 rounded-full border-4 border-pink-50 shadow-lg shadow-pink-200 transition-all ${activeTab === AppTab.ULTRASOUND ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white' : 'bg-white text-indigo-500 hover:scale-105'}`}
            >
                <CameraIcon className="w-8 h-8" />
            </button>
            <div className="text-center text-[10px] text-indigo-500 font-bold mt-1">超音波</div>
        </div>

        <button 
            onClick={() => setActiveTab(AppTab.CHECKUPS)}
            className={`flex flex-col items-center gap-1 transition-colors w-14 ${activeTab === AppTab.CHECKUPS ? 'text-pink-500' : 'hover:text-gray-600'}`}
        >
            <CalendarIcon className={activeTab === AppTab.CHECKUPS ? 'fill-pink-100' : ''} />
            產檢
        </button>

        <button 
            onClick={() => setActiveTab(AppTab.ADVICE)}
            className={`flex flex-col items-center gap-1 transition-colors w-14 ${activeTab === AppTab.ADVICE ? 'text-indigo-500' : 'hover:text-gray-600'}`}
        >
            <BrainIcon className={activeTab === AppTab.ADVICE ? 'fill-indigo-100' : ''} />
            AI 建議
        </button>

      </nav>
    </div>
  );
};

export default App;