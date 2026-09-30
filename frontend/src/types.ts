export interface StudentInput {
  gender: string;
  ssc_p: number;
  ssc_b: string;
  hsc_p: number;
  hsc_b: string;
  hsc_s: string;
  degree_p: number;
  degree_t: string;
  workex: string;
  etest_p: number;
  specialisation: string;
  mba_p: number;
}

export interface FeatureContribution {
  feature: string;
  feature_val: any;
  impact: number;
  description: string;
}

export interface PredictionResponse {
  prediction: string;
  probability: number;
  model_version: string;
  explanation: FeatureContribution[];
}

export interface JobRole {
  role_id: string;
  role_name: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  average_salary_range: string;
  demand_level: string;
}

export interface SkillAnalysisResponse {
  role_id: string;
  role_name: string;
  student_skills: string[];
  matched_skills: string[];
  missing_required: string[];
  missing_preferred: string[];
  match_score: number;
  status: string;
}

export interface RoadmapItem {
  step: number;
  skill: string;
  category: string;
  description: string;
  estimated_weeks: number;
  topics: string[];
}

export interface RoadmapResponse {
  role_id: string;
  role_name: string;
  current_skills: string[];
  roadmap: RoadmapItem[];
  total_weeks: number;
}

export interface PredictionRecord {
  id: number;
  prediction: string;
  probability: number;
  model_version: string;
  explanation: FeatureContribution[];
  inputs: StudentInput;
  created_at: string;
}
