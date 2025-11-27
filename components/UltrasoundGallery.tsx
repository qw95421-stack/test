import React, { useState, useRef } from 'react';
import { UltrasoundEntry } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon, CameraIcon } from './Icons';
import { analyzeUltrasound } from '../services/geminiService';

interface UltrasoundGalleryProps {
  entries: UltrasoundEntry[];
  currentWeek: number;
  onAddEntry: (entry: UltrasoundEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const UltrasoundGallery: React.FC<UltrasoundGalleryProps> = ({ entries, currentWeek, onAddEntry, onDeleteEntry }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image before saving to avoid LocalStorage limits
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Compress to JPEG with 0.7 quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImage(file);
        setPreviewUrl(compressed);
      } catch (err) {
        console.error("Error processing image", err);
        alert("圖片處理失敗");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;

    setAnalyzing(true);
    let analysis = "AI 分析中...";
    
    try {
      analysis = await analyzeUltrasound(previewUrl);
    } catch (err) {
      analysis = "暫時無法進行 AI 分析。";
    }

    const newEntry: UltrasoundEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      imageUrl: previewUrl,
      week: currentWeek,
      notes: notes,
      aiAnalysis: analysis
    };

    onAddEntry(newEntry);
    resetForm();
    setAnalyzing(false);
  };

  const resetForm = () => {
    setPreviewUrl(null);
    setNotes('');
    setIsAdding(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {!isAdding ? (
         <button 
            onClick={() => setIsAdding(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-200 hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2"
         >
            <CameraIcon /> 上傳超音波照片
         </button>
      ) : (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4">新增超音波紀錄</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="max-h-64 rounded-lg object-contain" />
                    ) : (
                        <div className="text-center text-gray-400">
                            <CameraIcon className="w-10 h-10 mx-auto mb-2" />
                            <p>點擊上傳照片</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                    />
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">心情記事 (選填)</label>
                      <textarea 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        placeholder="看著寶寶的小手手..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200 h-20 resize-none text-gray-900 placeholder-gray-400" 
                      />
                  </div>

                  <div className="bg-indigo-50 p-3 rounded-lg flex items-start gap-2 text-indigo-700 text-sm">
                    <SparklesIcon className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>照片上傳後，AI 將自動協助您解讀影像中的寶寶特徵。</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                      <button type="button" onClick={resetForm} className="flex-1 py-3 text-gray-500 font-medium">取消</button>
                      <button 
                        type="submit" 
                        disabled={!previewUrl || analyzing} 
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {analyzing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                分析中...
                            </>
                        ) : '儲存並分析'}
                      </button>
                  </div>
              </form>
          </div>
      )}

      <div className="grid grid-cols-1 gap-4">
          {sortedEntries.length === 0 && !isAdding && (
              <p className="text-center text-gray-400 py-10">尚無照片，快來記錄寶寶的第一張寫真吧！</p>
          )}

          {sortedEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="relative">
                    <img src={entry.imageUrl} alt="Ultrasound" className="w-full h-64 object-cover" />
                    <div className="absolute top-2 right-2">
                        <button 
                            onClick={() => onDeleteEntry(entry.id)}
                            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 text-white">
                        <p className="font-bold text-lg">第 {entry.week} 週</p>
                        <p className="text-xs opacity-80">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-3">
                      {entry.notes && (
                          <p className="text-gray-600 italic">"{entry.notes}"</p>
                      )}
                      
                      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <h4 className="flex items-center gap-2 text-indigo-800 font-bold mb-2 text-sm">
                              <SparklesIcon className="w-4 h-4" /> AI 解讀
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                              {entry.aiAnalysis || "分析中..."}
                          </p>
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default UltrasoundGallery;