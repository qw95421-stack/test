import React, { useState, useEffect } from 'react';
import { getPregnancyAdvice } from '../services/geminiService';
import { AIAdvice } from '../types';
import { BrainIcon } from './Icons';

interface GeminiAdviceProps {
  currentWeek: number;
}

const GeminiAdvice: React.FC<GeminiAdviceProps> = ({ currentWeek }) => {
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPregnancyAdvice(currentWeek);
      setAdvice(data);
    } catch (e) {
        console.error(e);
      setError('目前無法獲取建議，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we have cached advice for this week in sessionStorage to save API calls
    const cached = sessionStorage.getItem(`advice_week_${currentWeek}`);
    if (cached) {
      setAdvice(JSON.parse(cached));
    } else {
       // Only auto-fetch if we haven't seen it, otherwise user can click
       // For this demo, let's make user click to avoid API spam on mount if they just check dashboard
    }
  }, [currentWeek]);

  useEffect(() => {
    if (advice) {
        sessionStorage.setItem(`advice_week_${currentWeek}`, JSON.stringify(advice));
    }
  }, [advice, currentWeek]);

  if (!advice && !loading) {
      return (
          <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-sm border border-indigo-50 text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-2">
                  <BrainIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">獲取第 {currentWeek} 週的健康建議</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                  讓 AI 為妳生成本週的健康提示、寶寶發展狀況以及注意事項。
              </p>
              <button 
                onClick={fetchAdvice}
                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                  生成建議
              </button>
          </div>
      )
  }

  return (
    <div className="space-y-6">
        {loading && (
             <div className="p-10 text-center">
                 <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
                 <p className="text-gray-500 font-medium">正在諮詢 AI 知識庫...</p>
             </div>
        )}

        {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
                {error}
                <button onClick={fetchAdvice} className="block mx-auto mt-2 text-sm font-bold underline">再試一次</button>
            </div>
        )}

        {advice && !loading && (
            <div className="animate-fade-in space-y-4">
                 <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg shadow-indigo-200 relative overflow-hidden">
                     <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                     <h3 className="text-xl font-bold mb-1">第 {currentWeek} 週 重點</h3>
                     <p className="opacity-90 text-sm">AI 生成摘要</p>
                 </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-lg">
                        <span className="text-2xl">👶</span> 寶寶發展
                     </h4>
                     <p className="text-gray-600 leading-relaxed bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                         {advice.babyFact}
                     </p>
                 </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-lg">
                        <span className="text-2xl">🌿</span> 健康小撇步
                     </h4>
                     <ul className="space-y-3">
                         {advice.tips.map((tip, idx) => (
                             <li key={idx} className="flex gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                                 <span className="text-gray-600">{tip}</span>
                             </li>
                         ))}
                     </ul>
                 </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-400">
                     <h4 className="font-bold text-red-500 flex items-center gap-2 mb-3 text-lg">
                        ⚠️ 重要提醒
                     </h4>
                     <p className="text-xs text-gray-400 mb-3 uppercase font-bold tracking-wider">若出現以下症狀請就醫：</p>
                     <ul className="space-y-2">
                         {advice.warningSigns.map((sign, idx) => (
                             <li key={idx} className="text-gray-700 font-medium flex items-center gap-2">
                                 <span className="text-red-400">•</span> {sign}
                             </li>
                         ))}
                     </ul>
                 </div>
                 
                 <div className="text-center">
                    <button onClick={fetchAdvice} className="text-indigo-500 text-sm font-semibold hover:text-indigo-700">
                        重新整理建議
                    </button>
                 </div>
            </div>
        )}
    </div>
  );
};

export default GeminiAdvice;