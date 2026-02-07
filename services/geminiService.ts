
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SelfAwarenessData, MarketData, CareerSuggestion, MarketAnalysisResult, GeneratedPlanData, ResumeAnalysisResult, JobListing } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

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

// --- MOCK DATA FOR ADZUNA FALLBACK ---
const MOCK_JOBS: JobListing[] = [
  { id: '1', title: 'Senior Software Engineer', company: { display_name: 'Tech Solutions Co.' }, location: { display_name: 'الرياض' }, description: 'نبحث عن مطور برمجيات خبير في React و Node.js...', redirect_url: '#', created: new Date().toISOString(), salary_min: 15000, salary_max: 22000 },
  { id: '2', title: 'Marketing Manager', company: { display_name: 'Creative Agency' }, location: { display_name: 'جدة' }, description: 'قيادة فريق التسويق الرقمي وبناء استراتيجيات النمو...', redirect_url: '#', created: new Date().toISOString(), salary_min: 12000, salary_max: 18000 },
  { id: '3', title: 'Data Scientist', company: { display_name: 'DataCorp' }, location: { display_name: 'الدمام' }, description: 'تحليل البيانات الكبيرة وبناء نماذج تعلم الآلة...', redirect_url: '#', created: new Date().toISOString(), salary_min: 18000, salary_max: 25000 },
  { id: '4', title: 'Project Manager', company: { display_name: 'BuildIt' }, location: { display_name: 'الرياض' }, description: 'إدارة المشاريع التقنية وضمان التسليم في الوقت المحدد...', redirect_url: '#', created: new Date().toISOString(), salary_min: 20000, salary_max: 30000 },
];

// Helper to fetch Adzuna
async function fetchAdzunaJobs(what: string, where: string): Promise<JobListing[]> {
  // Use process.env instead of import.meta.env to avoid TS errors
  const APP_ID = process.env.VITE_ADZUNA_APP_ID;
  const APP_KEY = process.env.VITE_ADZUNA_APP_KEY;
  const country = 'sa'; // Default to Saudi Arabia

  // If keys are missing, return mock data to ensure app functionality
  if (!APP_ID || !APP_KEY) {
    console.warn("Adzuna API credentials missing. Using mock data.");
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Filter mock data basically
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
     return MOCK_JOBS; // Fallback on error
  }
}

// Tool Definition for Function Calling
const adzunaToolDeclaration: FunctionDeclaration = {
  name: "search_adzuna_jobs",
  description: "Search for real-time job listings using Adzuna API. Use this when the user asks for open positions, vacancies, or job opportunities.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      what: { type: Type.STRING, description: "Job title, keywords, or company name (e.g. 'Software Engineer', 'Aramco')" },
      where: { type: Type.STRING, description: "Location (city or country), default to 'Saudi Arabia' if not specified." }
    },
    required: ["what"]
  }
};

export const searchJobsSmart = async (userQuery: string): Promise<{ text: string, jobs?: JobListing[] }> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        tools: [{ functionDeclarations: [adzunaToolDeclaration] }],
        systemInstruction: "You are a helpful career assistant. When asked about jobs, use the search_adzuna_jobs tool. If the user doesn't specify location, infer it or default to Saudi Arabia. After getting results, summarize the top 3 opportunities briefly in Arabic. If no tool is needed, just answer normally."
      }
    });

    const result = await chat.sendMessage({ message: userQuery });
    const call = result.functionCalls?.[0];

    if (call && call.name === "search_adzuna_jobs") {
       const { what, where } = call.args as any;
       const jobs = await fetchAdzunaJobs(what || '', where || 'sa');
       
       // Send result back to model to summarize
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
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze this user profile deeply and suggest the top 4 career paths suitable for them in the context of Saudi Vision 2030 and MENA market.

      User Profile:
      - Education: ${user.educationLevel} in ${user.major}
      - Experience: ${user.experienceYears} (${user.currentRole})
      - Skills: ${user.skills}
      - Values: ${user.workValues.join(', ')}
      - Goal: ${user.financialGoal}

      Return a JSON array of 4 objects.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Career suggestions failed:", error);
    return [];
  }
};

export const analyzeMarket = async (field: string, location: string, companies?: string, keywords?: string, industry?: string, companySize?: string): Promise<MarketAnalysisResult> => {
  try {
    let promptContext = `Conduct a real-time market analysis for "${field}" in "${location}" for the year 2024/2025.`;
    if (companies) promptContext += ` Focus on these target companies: ${companies}.`;
    if (industry) promptContext += ` Within the ${industry} industry.`;
    if (keywords) promptContext += ` Consider these keywords: ${keywords}.`;

    const searchResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `${promptContext}
      
      Find specific information on:
      1. Average salary ranges for Junior, Mid-level, and Senior roles (in local currency).
      2. Demand trends and growth projections.
      3. Top cities or regions with highest demand.
      4. Top 5 technical/hard skills currently required.
      5. Level of competition and entry difficulty.
      6. A brief executive summary of the market status.
      
      Provide a comprehensive text report.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const searchResultText = searchResponse.text;
    
    if (!searchResultText) {
      throw new Error("No data returned from search.");
    }

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
      model: MODEL_NAME,
      contents: `Extract market analysis data from the following text and format it into the specified JSON structure.
      
      Text to analyze:
      """
      ${searchResultText}
      """
      
      Requirements:
      - Map "Junior", "Mid", "Senior" salaries based on the text.
      - Estimate demand trends (volume 0-100) based on the text sentiment.
      - Determine competition level (Low/Medium/High).
      - Extract specific skills mentioned.
      - Ensure the summary is in Arabic.
      `,
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
       salaryData: [],
       geoData: [],
       demandTrend: [],
       topSkills: [],
       competitionLevel: "Medium",
       entryDifficulty: "Medium",
       growthRate: "Unknown",
       sources: []
    };
  }
};

export const getJobDetails = async (jobTitle: string): Promise<JobDetailsResponse> => {
  try {
    // Step 1: Perform Google Search for real-time data
    const searchResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Provide detailed, up-to-date career information for the job title: ${jobTitle} in Saudi Arabia/MENA region context.
      Search for:
      - Detailed job description and daily responsibilities.
      - Accurate monthly salary range in SAR.
      - Career progression path.
      - Required hard and soft skills.
      - Recommended education and certifications.
      - Top courses and learning resources.
      `,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const searchResultText = searchResponse.text || "";

    // Step 2: Format the search result into JSON
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Extract job details from the following text and format as JSON.
      
      Text to analyze:
      """
      ${searchResultText}
      """
      
      Return a JSON object with:
      - description: A brief and engaging description of the role.
      - salaryRange: Average monthly salary range in SAR (e.g. "10,000 - 15,000 SAR").
      - tasks: Array of 5-7 daily responsibilities.
      - careerPath: Array of job titles showing progression (Entry to Senior).
      - hardSkills: Array of technical skills.
      - softSkills: Array of soft skills.
      - education: Array of recommended degrees or majors.
      - certifications: Array of valuable professional certifications.
      - courses: Array of objects {title, provider} for recommended learning resources.
      `,
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
                properties: {
                  title: { type: Type.STRING },
                  provider: { type: Type.STRING }
                }
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
    console.error("Job details fetch failed:", error);
    throw new Error("Failed to fetch job details");
  }
};

export const generateCareerPlan = async (user: SelfAwarenessData, market: MarketData, marketAnalysis: MarketAnalysisResult): Promise<GeneratedPlanData> => {
  const contents = `Create a structured career roadmap.
      User: ${user.name}, ${user.currentRole}, ${user.experienceYears}.
      Target: ${market.field} in ${market.location}.
      Market Context: Growth ${marketAnalysis.growthRate}, Competition ${marketAnalysis.competitionLevel}.

      Return JSON:
      1. markdownPlan: Detailed narrative.
      2. timeline: Array {phaseName, duration, focus, milestones[]}.
      3. skillTree: Array {name, type(hard/soft), importance, level}.
      4. risks: Array {risk, impact, mitigation}.
      5. resources: Array {title, type, description}.
      6. actionPlan: {shortTerm[], mediumTerm[]}.
      7. networkingStrategy: {targetPeople, approachMethod, suggestedPlatforms[]}.
      `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        },
      },
    });

    const jsonText = response.text || "{}";
    try {
        return JSON.parse(jsonText);
    } catch (parseError) {
        console.warn("JSON truncation detected, attempting repair...", parseError);
        const repairedJson = repairJson(jsonText);
        return JSON.parse(repairedJson);
    }
  } catch (error: any) {
    console.error("Gemini failed:", error);
    throw new Error("فشل في إنشاء الخطة المهنية. يرجى المحاولة لاحقاً.");
  }
};

// --- NEW FEATURES SERVICES ---

export const analyzeResume = async (fileBase64: string, targetJob: string): Promise<ResumeAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: fileBase64
          }
        },
        {
          text: `Analyze this resume for the role of "${targetJob}". 
          Provide a structured critique in Arabic including:
          1. ATS Match Score (0-100).
          2. Top Strengths.
          3. Weaknesses.
          4. Missing Keywords that are crucial for this role (ATS keywords).
          5. Specific Improvement Tips.`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Resume analysis failed:", error);
    throw new Error("فشل في تحليل السيرة الذاتية");
  }
};

export const getInterviewQuestion = async (history: {role: string, text: string}[], jobTitle: string): Promise<string> => {
  try {
    // Construct chat history for context
    let prompt = `You are an expert HR Recruiter conducting a mock interview for the position of "${jobTitle}".
    Your goal is to assess the candidate's skills, cultural fit, and problem-solving abilities.
    
    Current state of interview:
    ${history.map(m => `${m.role === 'model' ? 'Recruiter' : 'Candidate'}: ${m.text}`).join('\n')}
    
    Task:
    - If this is the start, ask a welcoming opening question (e.g., "Tell me about yourself").
    - If the candidate just answered, briefly acknowledge their answer (give constructive feedback if it was weak) and ask the NEXT relevant question.
    - Keep questions professional but conversational.
    - Ask only ONE question at a time.
    - Output ONLY the recruiter's response text.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    return response.text || "Could not generate question.";
  } catch (error) {
    console.error("Interview generation failed:", error);
    return "حدث خطأ في النظام. هل يمكننا الانتقال للسؤال التالي؟";
  }
};

export const generateLinkedInContent = async (type: 'bio' | 'post', details: string, tone: string = 'Professional'): Promise<string> => {
  try {
    const prompt = type === 'bio' 
      ? `Write a professional LinkedIn Headline and About section based on these details: "${details}". Tone: ${tone}. In Arabic (with English technical terms if needed).`
      : `Write an engaging LinkedIn Post about: "${details}". Tone: ${tone}. Include hashtags and emojis. In Arabic.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    return response.text || "";
  } catch (error) {
    console.error("LinkedIn generation failed:", error);
    throw new Error("فشل في توليد المحتوى");
  }
};
