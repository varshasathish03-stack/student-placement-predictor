import React, { useState, useEffect } from 'react';
import { fetchRoles, analyzeSkills } from '../api';
import type { JobRole, SkillAnalysisResponse } from '../types';
import { CheckCircle2, XCircle, ArrowRight, AlertCircle } from 'lucide-react';

interface SkillAnalyzerProps {
  setActiveTab: (tab: string) => void;
  setSelectedSkillsForRoadmap: (skills: string[]) => void;
  setSelectedRoleForRoadmap: (roleId: string) => void;
}

export const SkillAnalyzer: React.FC<SkillAnalyzerProps> = ({
  setActiveTab,
  setSelectedSkillsForRoadmap,
  setSelectedRoleForRoadmap,
}) => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>(['Python', 'SQL', 'Git']);
  const [targetRoleId, setTargetRoleId] = useState<string>('data-analyst');
  const [analysis, setAnalysis] = useState<SkillAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles().then((data) => {
      setRoles(data.roles);
      setAvailableSkills(data.available_skills);
    });
  }, []);

  const toggleSkill = (skill: string) => {
    if (userSkills.includes(skill)) {
      setUserSkills(userSkills.filter((s) => s !== skill));
    } else {
      setUserSkills([...userSkills, skill]);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await analyzeSkills(userSkills, targetRoleId);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetRoleId) {
      handleAnalyze();
    }
  }, [userSkills, targetRoleId]);

  const handleViewRoadmap = () => {
    setSelectedSkillsForRoadmap(userSkills);
    setSelectedRoleForRoadmap(targetRoleId);
    setActiveTab('roadmap');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Skill Analyzer & Gap Analysis</h1>
        <p style={{ color: '#9ca3af' }}>
          Select your current technical skills and target job role to perform automated gap analysis.
        </p>
      </div>

      <div className="grid-2">
        {/* Skill Selector Card */}
        <div className="card">
          <div className="card-title">1. Your Current Skillset</div>
          <p className="card-subtitle">Click skills to add or remove them from your active profile.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {availableSkills.map((skill) => {
              const active = userSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${active ? '#10b981' : '#374151'}`,
                    backgroundColor: active ? 'rgba(16, 185, 129, 0.2)' : '#1f2937',
                    color: active ? '#10b981' : '#9ca3af',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {active ? `✓ ${skill}` : `+ ${skill}`}
                </button>
              );
            })}
          </div>

          <div className="card-title">2. Select Target Job Role</div>
          <div className="form-group">
            <select
              className="form-select"
              value={targetRoleId}
              onChange={(e) => setTargetRoleId(e.target.value)}
              style={{ fontSize: '1rem', padding: '0.75rem' }}
            >
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>
                  {r.role_name} ({r.average_salary_range})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skill Analysis Outcome Card */}
        <div className="card">
          <div className="card-title">3. Gap Analysis Result</div>

          {loading && <p style={{ color: '#9ca3af' }}>Calculating skill coverage...</p>}

          {analysis && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Match Score Summary */}
              <div style={{ padding: '1rem', backgroundColor: '#111827', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>TARGET ROLE MATCH</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f9fafb', marginTop: '0.2rem' }}>
                    {analysis.role_name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: analysis.match_score >= 80 ? '#10b981' : analysis.match_score >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {analysis.match_score}%
                  </div>
                  <div className="badge badge-info">{analysis.status}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${analysis.match_score}%`,
                      backgroundColor: analysis.match_score >= 80 ? '#10b981' : analysis.match_score >= 50 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>

              {/* Matched Skills */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> Matched Competencies ({analysis.matched_skills.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {analysis.matched_skills.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>No skills matched yet.</span>
                  ) : (
                    analysis.matched_skills.map((s) => (
                      <span key={s} className="badge badge-placed">{s}</span>
                    ))
                  )}
                </div>
              </div>

              {/* Missing Required Skills */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <XCircle size={16} /> High Priority Skill Gaps ({analysis.missing_required.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {analysis.missing_required.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: '#10b981' }}>All required skills satisfied!</span>
                  ) : (
                    analysis.missing_required.map((s) => (
                      <span key={s} className="badge badge-unplaced">{s}</span>
                    ))
                  )}
                </div>
              </div>

              {/* Missing Preferred Skills */}
              {analysis.missing_preferred.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={16} /> Preferred Skill Additions ({analysis.missing_preferred.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {analysis.missing_preferred.map((s) => (
                      <span key={s} style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Roadmap Action Button */}
              <button className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={handleViewRoadmap}>
                <span>Generate Career Roadmap for {analysis.role_name}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
