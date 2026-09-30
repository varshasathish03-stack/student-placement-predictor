import type { StudentInput, PredictionResponse, JobRole, SkillAnalysisResponse, RoadmapResponse, PredictionRecord } from './types';
import { API_BASE } from './config';

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function predictPlacement(data: StudentInput): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/api/prediction`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to get prediction');
  return res.json();
}

export async function fetchRoles(): Promise<{ roles: JobRole[]; available_skills: string[] }> {
  const res = await fetch(`${API_BASE}/api/roles`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch job roles');
  return res.json();
}

export async function analyzeSkills(skills: string[], target_role_id: string): Promise<SkillAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/skills/analyze`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ skills, target_role_id }),
  });
  if (!res.ok) throw new Error('Failed to analyze skills');
  return res.json();
}

export async function fetchRoadmap(skills: string[], target_role_id: string): Promise<RoadmapResponse> {
  const res = await fetch(`${API_BASE}/api/roadmap`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ skills, target_role_id }),
  });
  if (!res.ok) throw new Error('Failed to generate career roadmap');
  return res.json();
}

export async function fetchPredictionHistory(): Promise<PredictionRecord[]> {
  const res = await fetch(`${API_BASE}/api/student/history`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch prediction history');
  return res.json();
}
