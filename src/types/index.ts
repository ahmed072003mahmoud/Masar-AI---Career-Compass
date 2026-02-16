
export interface SelfAwarenessData {
  // 1. Demographics & Basic Info
  name?: string;
  ageGroup: string;
  gender: string;
  location: string;
  
  // 2. Education & Professional Status
  educationLevel: string;
  major: string;
  currentRole: string; // Job title or "Student"
  experienceYears: string;
  
  // 3. Skills & Competencies
  skills: string; // Soft & Hard skills combined or separated text
  languages: string;
  
  // 4. Values & Personality
  workValues: string[]; // Array of selected values (e.g., Work-Life Balance)
  workEnvironment: string;
  personalityType: string; // e.g., Analytical, Creative, Leader
  interests: string;
  
  // 5. Goals & Constraints
  financialGoal: string;
  timeline: string;
  constraints: string; // Geographic, Financial, Time
  
  // Legacy fields
  strengths: string;
  weaknesses: string;
  riskTolerance: string;
  autonomyLevel: string;
  communicationStyle: string;
  problemSolvingApproach: string;
  careerAspirations: string;
}

export interface MarketData {
  field: string;
  location: string;
  targetCompanies?: string;
  industryFocus?: string;
  companySize?: string;
  keywords?: string; 
  specificSkills?: string; 
}

// --- VISUALIZATION TYPES ---

export interface SalaryRange {
  level: string; // e.g., "Junior", "Senior"
  min: number;
  max: number;
  currency: string;
}

export interface GeoDistribution {
  city: string;
  percentage: number;
}

export interface DemandTrend {
  year: string;
  volume: number; // Normalized 0-100 score
}

export interface MarketAnalysisResult {
  summary: string; // Executive summary
  salaryData: SalaryRange[];
  geoData: GeoDistribution[];
  demandTrend: DemandTrend[];
  topSkills: string[];
  competitionLevel: 'Low' | 'Medium' | 'High';
  entryDifficulty: 'Easy' | 'Medium' | 'Hard';
  growthRate: string; // e.g. "+15%"
  sources: { title: string; url: string }[];
}

export interface CareerPhase {
  phaseName: string;
  duration: string;
  focus: string;
  milestones: string[];
}

export interface SkillNode {
  name: string;
  type: 'hard' | 'soft';
  importance: 'critical' | 'bonus';
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface RiskFactor {
  risk: string;
  impact: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface GeneratedPlanData {
  markdownPlan: string;
  timeline: CareerPhase[];
  skillTree: SkillNode[];
  risks: RiskFactor[];
  resources: { title: string; type: string; description: string }[];
  actionPlan: { shortTerm: string[], mediumTerm: string[] };
  networkingStrategy: { targetPeople: string; approachMethod: string; suggestedPlatforms: string[] };
}

export interface CareerSuggestion {
  title: string;
  matchPercentage: number;
  reason: string;
  difficulty: 'High' | 'Medium' | 'Low';
  trending: boolean;
}

export interface AppState {
  step: number;
  view: 'wizard' | 'resources';
  userData: SelfAwarenessData;
  marketData: MarketData;
  marketAnalysis: MarketAnalysisResult | null;
  generatedPlan: GeneratedPlanData | null;
  suggestions?: CareerSuggestion[];
}

export enum Step {
  WELCOME = 0,
  SELF_AWARENESS = 1,
  SUGGESTIONS = 2, 
  MARKET_RESEARCH = 3,
  PLANNING = 4,
  RESULT = 5
}

// --- NEW FEATURES TYPES ---

export interface ResumeAnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvementTips: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export type LinkedInContentType = 'bio' | 'post' | 'connection_request';

export interface JobListing {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
}
