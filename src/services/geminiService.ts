
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SelfAwarenessData, MarketData, CareerSuggestion, MarketAnalysisResult, GeneratedPlanData, ResumeAnalysisResult, JobListing } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models configuration
const MODEL_FLASH = "gemini-3-flash-preview"; // Best for Search Grounding & Tools
const MODEL_PRO = "gemini-3-pro-preview";     // Best for Thinking & Complex Reasoning

export interface JobDetailsResponse {
  description: string;
  salaryRange: string;
  tasks: string[];
  careerPath: string[];
  hardSkills: string[];
  softSkills: string[];
  education: string[];
  certifications: string[];
  courses: Array<{ title: string; provider: string }>;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

// Utility to attempt repairing truncated JSON
const repairJson = (jsonString: string): string => {
  try {
    return JSON.parse(jsonString) && jsonString;
  } catch (e) {
    let repaired = jsonString.trim();
    if (repaired.startsWith("```json")) repaired = repaired.replace(/^```json/, "");
    if (repaired.startsWith("```")) repaired = repaired.replace(/^```/, "");
    
    const stack = [];
    let inString = false;
    let escape = false;
    
    for (const char of repaired) {
        if (escape) { escape = false; continue; }
        if (char === '\\') { escape = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (inString) continue;
        
        if (char === '{' || char === '[') stack.push(char === '{' ? '}' : ']');
        if (char === '}' || char === ']') {
            if (stack.length > 0 && stack[stack.length - 1] === char) stack.pop();
        }
    }
    
    if (inString) repaired += '"';
    while (stack.length > 0) {
        repaired += stack.pop();
    }
    
    return repaired;
  }
};

// Fallback logic wrapper
async function withFallback<T>(
  primaryFn: () => Promise<T>, 
  fallbackFn: () => Promise<T>, 
  context: string
): Promise<T> {
  try {
    return await primaryFn();
  } catch (error: any) {
    const msg = error.message || '';
    // Handle Quota (429) and Server Overload (503)
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('503')) {
      console.warn(`[${context}] Primary model failed (Quota/Server). Switching to fallback...`);
      try {
        return await fallbackFn();
      } catch (fallbackError: any) {
        console.error(`[${context}] Fallback failed:`, fallbackError);
        throw new Error("الخادم مشغول جداً حالياً. يرجى المحاولة بعد دقيقة.");
      }
    }
    throw error;
  }
}

// --- MOCK DATA FOR ADZUNA FALLBACK ---
const MOCK_JOBS: JobListing[] = [
  { id: '1', title: 'Senior Software Engineer', company: { display_name: 'Tech Solutions Co.' }, location: { display_name: 'الرياض' }, description: 'نبحث عن مطور برمجيات خبير في React و Node.js...', redirect_url: '#', created: new Date().toISOString(), salary_min: 15000, salary_max: 22000 },
  { id: '2', title: 'Marketing Manager', company: { display_name: 'Creative Agency' }, location: { display_name: 'جدة' }, description: 'قيادة فريق التسويق الرقمي وبناء استراتيجيات النمو...', redirect_url: '#', created: new Date().toISOString(), salary_min: 12000, salary_max: 18000 },
  { id: '3', title: 'Data Scientist', company: { display_name: 'DataCorp' }, location: { display_name: 'الدمام' }, description: 'تحليل البيانات الكبيرة وبناء نماذج تعلم الآلة...', redirect_url: '#', created: new Date().toISOString(), salary_min: 18000, salary_max: 25000 },
  { id: '4', title: 'Project Manager', company: { display_name: 'BuildIt' }, location: { display_name: 'الرياض' }, description: 'إدارة المشاريع التقنية وضمان التسليم في الوقت المحدد...', redirect_url: '#', created: new Date().toISOString(), salary_min: 20000, salary_max: 30000 },
];

// Helper to fetch Adzuna
async function fetchAdzunaJobs(what: string, where: string): Promise<JobListing[]> {
  const APP_ID = process.env.VITE_ADZUNA_APP_ID;
  const APP_KEY = process.env.VITE_ADZUNA_APP_KEY;
  const country = 'sa'; 

  if (!APP_ID || !APP_KEY) {
    console.warn("Adzuna API credentials missing. Using mock data.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_JOBS.filter(j => 
      j.title.toLowerCase().includes(what.toLowerCase()) || 
      j.location.display_name.toLowerCase().includes(where.toLowerCase())
    );
  }

  try {
     const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=10&what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}&content-type=application/json`);
     if (!response.ok) throw new Error("API call failed");
     const data = await response.json();
     return data.results || [];
  } catch (e) {
     console.error("Adzuna API Error:", e);
     return MOCK_JOBS; 
  }
}

// Tool Definition for Function Calling
const adzunaToolDeclaration: FunctionDeclaration = {
  name: "search_adzuna_jobs",
  description: "Search for real-time job listings using Adzuna API.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      what: { type: Type.STRING, description: "Job title, keywords, or company name." },
      where: { type: Type.STRING, description: "Location (city or country), default to 'Saudi Arabia'." }
    },
    required: ["what"]
  }
};

export const searchJobsSmart = async (userQuery: string): Promise<{ text: string, jobs?: JobListing[] }> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_FLASH, 
      config: {
        tools: [{ functionDeclarations: [adzunaToolDeclaration] }],
        systemInstruction: "You are a helpful career assistant. When asked about jobs, use the search_adzuna_jobs tool. Summarize top 3 results in Arabic."
      }
    });

    const result = await chat.sendMessage({ message: userQuery });
    const call = result.functionCalls?.[0];

    if (call && call.name === "search_adzuna_jobs") {
       const { what, where } = call.args as any;
       const jobs = await fetchAdzunaJobs(what || '', where || 'sa');
       
       const toolResponse = await chat.sendMessage({
         message: [{
           functionResponse: {
             name: call.name,
             response: { result: jobs.slice(0, 5) },
             id: call.id
           }
         }]
       });
       
       return { text: toolResponse.text || "وجدنا هذه الوظائف لك:", jobs: jobs };
    }

    return { text: result.text || "" };
  } catch (error) {
    console.error("Smart Search Error:", error);
    return { text: "عذراً، حدث خطأ أثناء البحث عن الوظائف." };
  }
};

export const getCareerSuggestions = async (user: SelfAwarenessData): Promise<CareerSuggestion[]> => {
  const prompt = `Analyze this user profile deeply and suggest the top 4 career paths suitable for them in Saudi Arabia/MENA.
      User Profile:
      - Education: ${user.educationLevel} in ${user.major}
      - Experience: ${user.experienceYears} (${user.currentRole})
      - Skills: ${user.skills}
      - Values: ${user.workValues.join(', ')}
      - Goal: ${user.financialGoal}

      Return a JSON array of 4 objects.`;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        matchPercentage: { type: Type.INTEGER },
        reason: { type: Type.STRING },
        difficulty: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
        trending: { type: Type.BOOLEAN }
      },
      required: ["title", "matchPercentage", "reason", "difficulty", "trending"]
    }
  };

  try {
    return await withFallback(
      // Primary: Pro with Thinking
      async () => {
        const response = await ai.models.generateContent({
          model: MODEL_PRO,
          contents: prompt,
          config: {
            thinkingConfig: { thinkingBudget: 16000 }, 
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });
        return JSON.parse(response.text || "[]");
      },
      // Fallback: Flash (Cheaper/Faster, No Thinking)
      async () => {
        const response = await ai.models.generateContent({
          model: MODEL_FLASH,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });
        return JSON.parse(response.text || "[]");
      },
      "Career Suggestions"
    );
  } catch (error) {
    console.error("Career suggestions failed:", error);
    // Return safe default to avoid app crash
    return [
      { title: user.currentRole || 'مسار مهني عام', matchPercentage: 70, reason: 'بناءً على معلوماتك الحالية (تعذر الاتصال بالخادم الذكي)', difficulty: 'Medium', trending: true },
      { title: 'متخصص تطوير أعمال', matchPercentage: 60, reason: 'خيار بديل عام يناسب العديد من التخصصات', difficulty: 'Low', trending: true }
    ];
  }
};

export const analyzeMarket = async (field: string, location: string, companies?: string, keywords?: string, industry?: string, companySize?: string): Promise<MarketAnalysisResult> => {
  try {
    let promptContext = `Conduct a real-time market analysis for "${field}" in "${location}" for the year 2024/2025.`;
    if (companies) promptContext += ` Focus on these target companies: ${companies}.`;
    if (industry) promptContext += ` Within the ${industry} industry.`;

    const searchResponse = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `${promptContext}
      Find: Salary ranges (Junior, Mid, Senior), Demand trends, Top cities, Top 5 skills, Competition level.
      Provide a text report.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const searchResultText = searchResponse.text;
    if (!searchResultText) throw new Error("No data returned from search.");

    const sources: { title: string; url: string }[] = [];
    const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({ title: chunk.web.title, url: chunk.web.uri });
        }
      });
    }

    const formattingResponse = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Extract market analysis data from the text below and format as JSON.
      Text: """${searchResultText}"""
      Summary must be in Arabic.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            salaryData: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  level: { type: Type.STRING }, 
                  min: { type: Type.NUMBER }, 
                  max: { type: Type.NUMBER },
                  currency: { type: Type.STRING } 
                } 
              } 
            },
            geoData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { city: { type: Type.STRING }, percentage: { type: Type.NUMBER } }
              }
            },
            demandTrend: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { year: { type: Type.STRING }, volume: { type: Type.NUMBER } }
              }
            },
            topSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitionLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            entryDifficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
            growthRate: { type: Type.STRING }
          },
          required: ["summary", "salaryData", "geoData", "topSkills", "competitionLevel", "growthRate"]
        }
      }
    });

    const jsonText = formattingResponse.text || "{}";
    const data = JSON.parse(jsonText);
    return { ...data, sources };

  } catch (error) {
    console.error("Market analysis failed:", error);
    return {
       summary: "تعذر إجراء تحليل السوق المباشر. يرجى المحاولة مرة أخرى لاحقاً.",
       salaryData: [], geoData: [], demandTrend: [], topSkills: [], competitionLevel: "Medium", entryDifficulty: "Medium", growthRate: "Unknown", sources: []
    };
  }
};

export const getJobDetails = async (jobTitle: string): Promise<JobDetailsResponse> => {
  try {
    const searchResponse = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Provide detailed career info for: ${jobTitle} in Saudi Arabia.`,
      config: { tools: [{ googleSearch: {} }] },
    });

    const searchResultText = searchResponse.text || "";

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Extract job details from text and format as JSON. Text: """${searchResultText}"""`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            salaryRange: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
            careerPath: { type: Type.ARRAY, items: { type: Type.STRING } },
            hardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            education: { type: Type.ARRAY, items: { type: Type.STRING } },
            certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            courses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, provider: { type: Type.STRING } }
              }
            }
          },
          required: ["description", "salaryRange", "tasks", "careerPath", "hardSkills", "softSkills"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as JobDetailsResponse;
  } catch (error) {
    throw new Error("Failed to fetch job details");
  }
};

export const generateCareerPlan = async (user: SelfAwarenessData, market: MarketData, marketAnalysis: MarketAnalysisResult): Promise<GeneratedPlanData> => {
  const contents = `Create a Career Roadmap for ${user.name}, Role: ${user.currentRole}, Target: ${market.field} in ${market.location}. Market Context: ${marketAnalysis.growthRate} growth. Return JSON.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      markdownPlan: { type: Type.STRING },
      timeline: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            phaseName: { type: Type.STRING },
            duration: { type: Type.STRING },
            focus: { type: Type.STRING },
            milestones: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
      skillTree: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['hard', 'soft'] },
            importance: { type: Type.STRING },
            level: { type: Type.STRING }
          }
        }
      },
      risks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            risk: { type: Type.STRING },
            impact: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            mitigation: { type: Type.STRING }
          }
        }
      },
      resources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, type:{type:Type.STRING}, description:{type:Type.STRING} } } },
      actionPlan: { type: Type.OBJECT, properties: { shortTerm: {type:Type.ARRAY, items:{type:Type.STRING}}, mediumTerm: {type:Type.ARRAY, items:{type:Type.STRING}} } },
      networkingStrategy: { type: Type.OBJECT, properties: { targetPeople: {type:Type.STRING}, approachMethod: {type:Type.STRING}, suggestedPlatforms: {type:Type.ARRAY, items:{type:Type.STRING}} } }
    },
    required: ["markdownPlan", "timeline", "skillTree", "risks", "actionPlan"]
  };

  try {
    return await withFallback(
      async () => {
        const response = await ai.models.generateContent({
          model: MODEL_PRO,
          contents,
          config: {
            thinkingConfig: { thinkingBudget: 16000 }, 
            responseMimeType: "application/json",
            responseSchema: schema
          },
        });
        const jsonText = response.text || "{}";
        return JSON.parse(repairJson(jsonText));
      },
      async () => {
        const response = await ai.models.generateContent({
          model: MODEL_FLASH,
          contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema
          },
        });
        const jsonText = response.text || "{}";
        return JSON.parse(repairJson(jsonText));
      },
      "Career Plan"
    );
  } catch (error: any) {
    console.error("Gemini failed:", error);
    throw new Error("فشل في إنشاء الخطة المهنية. يرجى المحاولة لاحقاً.");
  }
};

export const analyzeResume = async (fileBase64: string, targetJob: string): Promise<ResumeAnalysisResult> => {
  const contents = [
    { inlineData: { mimeType: "application/pdf", data: fileBase64 } },
    { text: `ATS Scanner for "${targetJob}". Return JSON.` }
  ];

  const schema = {
    type: Type.OBJECT,
    properties: {
      matchScore: { type: Type.NUMBER },
      summary: { type: Type.STRING },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
      missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["matchScore", "summary", "strengths", "missingKeywords", "improvementTips"]
  };

  try {
    return await withFallback(
      async () => {
        const response = await ai.models.generateContent({
          model: MODEL_PRO,
          contents: contents,
          config: {
            thinkingConfig: { thinkingBudget: 8000 },
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });
        return JSON.parse(repairJson(response.text || "{}"));
      },
      async () => {
        const response = await ai.models.generateContent({
          model: MODEL_FLASH,
          contents: contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });
        return JSON.parse(repairJson(response.text || "{}"));
      },
      "Resume Analysis"
    );
  } catch (error) {
    console.error("Resume analysis failed:", error);
    throw new Error("فشل في تحليل السيرة الذاتية");
  }
};

export const getInterviewQuestion = async (history: {role: string, text: string}[], jobTitle: string): Promise<string> => {
  try {
    const previousHistory = history.slice(0, -1).map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));
    const lastItem = history[history.length - 1];
    const messageToSend = lastItem ? lastItem.text : "Start interview.";

    const chat = ai.chats.create({
      model: MODEL_FLASH, 
      history: previousHistory,
      config: {
        systemInstruction: `HR Recruiter for "${jobTitle}". Ask one question at a time in Arabic.`
      }
    });

    const result = await chat.sendMessage({ message: messageToSend });
    return result.text || "Could not generate question.";
  } catch (error) {
    return "حدث خطأ في النظام.";
  }
};

export const generateLinkedInContent = async (type: 'bio' | 'post', details: string, tone: string = 'Professional'): Promise<string> => {
  try {
    const prompt = `Write LinkedIn ${type} about "${details}". Tone: ${tone}. Language: Arabic.`;
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 4000 } }
    });
    return response.text || "";
  } catch (error) {
    throw new Error("فشل في توليد المحتوى");
  }
};

export const generateLearningRoadmap = async (role: string, level: string): Promise<string> => {
  try {
    const prompt = `Create a learning roadmap for '${role}' (${level}) in Arabic. Markdown format.`;
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return response.text || "فشل في إنشاء خارطة الطريق.";
  } catch (error) {
    throw new Error("فشل في إنشاء خارطة الطريق");
  }
};

export const generateQuiz = async (topic: string, level: string): Promise<QuizQuestion[]> => {
  const prompt = `Generate 5 multiple choice technical interview questions about "${topic}" (Level: ${level}). Language: Arabic.`;
  
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correct: { type: Type.STRING },
        explanation: { type: Type.STRING }
      },
      required: ["question", "options", "correct", "explanation"]
    }
  };

  return withFallback(
    async () => {
      const res = await ai.models.generateContent({
        model: MODEL_PRO,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
      });
      return JSON.parse(res.text || "[]");
    },
    async () => {
      const res = await ai.models.generateContent({
        model: MODEL_FLASH,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
      });
      return JSON.parse(res.text || "[]");
    },
    "Quiz Generation"
  );
};
