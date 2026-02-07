
import React, { useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { generateLearningRoadmap } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';

const LearningRoadmap = () => {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState('');

  const handleGenerate = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const result = await generateLearningRoadmap(role, level);
      setRoadmap(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <Card title="🗺️ مولد خارطة التعلم (Learning Roadmap)">
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
          احصل على خطة تعلم مخصصة لتعلم مهارة جديدة أو تغيير مسارك المهني، مقسمة إلى مراحل ومشاريع عملية.
        </p>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">المسمى الوظيفي / المهارة</label>
                <input 
                    type="text" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="مثال: Full Stack Developer, Data Analyst..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none"
                />
            </div>
            <div className="md:w-1/3">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">المستوى الحالي</label>
                <select 
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                    <option value="Beginner">مبتدئ (Beginner)</option>
                    <option value="Intermediate">متوسط (Intermediate)</option>
                    <option value="Advanced">متقدم (Advanced)</option>
                </select>
            </div>
        </div>
        <Button onClick={handleGenerate} isLoading={loading} disabled={!role} variant="gradient" fullWidth>
            إنشاء الخطة 🚀
        </Button>

        {roadmap && (
            <div className="mt-8 animate-fade-in-up bg-slate-50 dark:bg-surface-800 p-6 rounded-2xl border border-slate-200 dark:border-surface-700">
                <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                    {roadmap}
                </ReactMarkdown>
            </div>
        )}
      </Card>
    </div>
  );
};

export default LearningRoadmap;
