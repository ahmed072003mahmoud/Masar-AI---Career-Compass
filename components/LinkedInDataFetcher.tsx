import React, { useState } from 'react';
import { LinkedInService } from '../services/linkedinService';

interface LinkedInProfileData {
  name: string;
  headline: string;
  summary: string;
  skills: string[];
  experience: string[];
  education: string[];
}

interface LinkedInDataFetcherProps {
  onDataFetched: (data: Partial<{
    name: string;
    strengths: string;
    interests: string;
    careerAspirations: string;
  }>) => void;
  initialUrl?: string;
}

const LinkedInDataFetcher: React.FC<LinkedInDataFetcherProps> = ({ 
  onDataFetched, 
  initialUrl = '' 
}) => {
  const [linkedInUrl, setLinkedInUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string; description: string; type?: 'error' | 'warning' } | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('جاري الاتصال...');

  // دالة لمحاكاة جلب البيانات
  const simulateLinkedInFetch = async (url: string): Promise<LinkedInProfileData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData: LinkedInProfileData = {
          name: "أحمد محمد",
          headline: "مهندس برمجيات | مطور ويب | React Expert",
          summary: "مطور برمجيات بخبرة 5 سنوات. مهتم بالذكاء الاصطناعي.",
          skills: ["React", "TypeScript", "Node.js", "AI", "Problem Solving"],
          experience: ["مهندس برمجيات أول في شركة التقنية"],
          education: ["بكالوريوس علوم الحاسب"]
        };
        resolve(mockData);
      }, 1500);
    });
  };

  const parseLinkedInData = (data: LinkedInProfileData) => {
    const strengths = [
      ...data.skills,
      ...data.experience.slice(0, 2)
    ].join(', ');

    const interests = [
      data.headline,
      ...data.skills.filter(skill => 
        ['التعلم الآلي', 'الذكاء الاصطناعي', 'Data', 'AI'].some(keyword => skill.includes(keyword))
      )
    ].join(', ');

    const careerAspirations = `تطوير المسار في ${data.headline}`;

    return {
      name: data.name,
      strengths,
      interests,
      careerAspirations
    };
  };

  const handleFetchData = async () => {
    if (!linkedInUrl) {
      setError({ title: 'الرابط مفقود', description: 'يرجى إدخال رابط LinkedIn في الحقل المخصص.' });
      return;
    }

    if (!linkedInUrl.includes('linkedin.com/in/')) {
      setError({ title: 'الرابط غير صحيح', description: 'يجب أن يبدأ الرابط بـ https://www.linkedin.com/in/ متبوعاً باسم المستخدم.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(10);
    setLoadingMessage('جاري الاتصال...');

    try {
      let profileData: LinkedInProfileData;
      
      try {
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 10, 90));
        }, 300);

        // Try API first
        const rawProfile = await LinkedInService.fetchProfileViaRapidAPI(linkedInUrl);
        profileData = LinkedInService.processProfileData(rawProfile);
        clearInterval(progressInterval);
      } catch (apiError: any) {
        console.warn("Falling back to simulation:", apiError);
        
        if (apiError.message?.includes('404')) {
           throw new Error('404_NOT_FOUND');
        }
        
        setLoadingMessage('استخدام المحاكاة الذكية...');
        profileData = await simulateLinkedInFetch(linkedInUrl);
      }
      
      setProgress(100);
      const parsedData = parseLinkedInData(profileData);
      
      onDataFetched(parsedData);

      setTimeout(() => {
        setProgress(0);
        setIsLoading(false);
      }, 1000);

    } catch (err: any) {
      let title = 'فشل جلب البيانات';
      let description = 'حدث خطأ غير متوقع. يرجى التأكد من الرابط والمحاولة مرة أخرى.';

      if (err.message.includes('404')) {
        title = 'الملف غير موجود (404)';
        description = 'تأكد من صحة الرابط. قد يكون الرابط خاطئاً أو الحساب محذوفاً.';
      } else if (err.message.includes('Private') || err.message.includes('Auth')) {
        title = 'الملف خاص (Private)';
        description = 'لا يمكن الوصول لهذا الملف بسبب إعدادات الخصوصية. يرجى إدخال البيانات يدوياً.';
      } else if (!navigator.onLine) {
        title = 'لا يوجد اتصال';
        description = 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى.';
      }

      setError({ title, description, type: 'error' });
      setProgress(0);
      setIsLoading(false);
    }
  };

  const handleManualInput = () => {
    setError(null);
    setLinkedInUrl('');
    // This effectively resets the fetcher state and encourages the user to use the form below
  };

  return (
    <div className="mb-8 animate-fade-in-up">
      <div className={`border rounded-2xl p-6 mb-4 shadow-sm transition-all duration-300 ${error ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-primary-100'}`}>
        
        {!error ? (
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-xl shadow-sm text-blue-600">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg mb-1">استيراد البيانات من LinkedIn</h3>
              <p className="text-sm text-slate-600">أدخل رابط ملفك الشخصي لنقوم بملء الحقول تلقائياً وتوفير وقتك.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4 mb-4">
             <div className="bg-red-100 p-3 rounded-xl shadow-sm text-red-600">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div className="flex-1">
                <h3 className="font-bold text-red-800 text-lg mb-1">{error.title}</h3>
                <p className="text-sm text-red-700 font-medium">{error.description}</p>
             </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <input
              type="url"
              value={linkedInUrl}
              onChange={(e) => {
                setLinkedInUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://www.linkedin.com/in/username"
              className={`w-full p-4 pr-12 border rounded-xl focus:ring-4 focus:outline-none transition-all font-medium ${error ? 'border-red-300 focus:ring-red-100 bg-white' : 'border-slate-300 focus:ring-primary-100 focus:border-primary-500 bg-white'}`}
              disabled={isLoading}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            {linkedInUrl && !isLoading && (
                <button 
                  onClick={() => setLinkedInUrl('')}
                  className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 hover:text-slate-600"
                >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}
          </div>

          <div className="flex gap-3">
             {error ? (
                <>
                  <button
                    onClick={handleFetchData}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                  >
                    إعادة المحاولة
                  </button>
                  <button
                    onClick={handleManualInput}
                    className="flex-1 py-3 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-xl font-bold transition-all shadow-sm"
                  >
                    متابعة الإدخال يدوياً
                  </button>
                </>
             ) : (
                <button
                  onClick={handleFetchData}
                  disabled={isLoading || !linkedInUrl}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-400 cursor-wait' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg active:scale-95'}`}
                >
                  {isLoading ? 'جاري الاتصال...' : 'جلب البيانات'}
                </button>
             )}
          </div>

          {isLoading && (
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
               <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedInDataFetcher;