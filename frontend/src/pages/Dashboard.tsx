import React from 'react';
import { Target, Award, Map } from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', border: '1px solid #374151' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-info" style={{ marginBottom: '0.75rem' }}>Empirical ML Model Loaded</div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Student Placement & Career Skill Intelligence
            </h1>
            <p style={{ color: '#9ca3af', maxWidth: '650px' }}>
              Real-time machine learning predictions trained on the Kaggle Campus Placement dataset. Analyze your academic parameters, identify skill gaps against industry roles, and generate customized career roadmaps.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setActiveTab('predictor')}>
            <Target size={18} />
            Run Placement Check
          </button>
        </div>
      </div>

      {/* Overview Stat Boxes */}
      <div className="grid-4">
        <div className="stat-box">
          <div className="stat-label">DATASET SOURCE</div>
          <div className="stat-value" style={{ fontSize: '1.2rem', color: '#10b981' }}>Kaggle Verified</div>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>215 student profiles</p>
        </div>

        <div className="stat-box">
          <div className="stat-label">MODEL ACCURACY</div>
          <div className="stat-value" style={{ color: '#6366f1' }}>86.1%</div>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>5-Fold Stratified CV</p>
        </div>

        <div className="stat-box">
          <div className="stat-label">ROC-AUC SCORE</div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>0.938</div>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>Logistic Regression Pipeline</p>
        </div>

        <div className="stat-box">
          <div className="stat-label">JOB ROLE CATALOGUE</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>10 Roles</div>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>Tech & Data Science</p>
        </div>
      </div>

      {/* Feature Modules Cards */}
      <div className="grid-3">
        <div className="card">
          <div className="card-title">
            <Target size={20} color="#10b981" />
            Placement Predictor
          </div>
          <p className="card-subtitle">
            Evaluate your placement probability based on 10th %, 12th %, degree %, employability test, and MBA scores.
          </p>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setActiveTab('predictor')}>
            Launch Predictor
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            <Award size={20} color="#6366f1" />
            Skill Gap Analyzer
          </div>
          <p className="card-subtitle">
            Compare your active technical skills against target roles to identify missing competencies.
          </p>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setActiveTab('skills')}>
            Analyze Skills
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            <Map size={20} color="#8b5cf6" />
            Career Roadmap
          </div>
          <p className="card-subtitle">
            Generate a step-by-step learning sequence complete with estimated timeline and key topics.
          </p>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setActiveTab('roadmap')}>
            View Roadmap
          </button>
        </div>
      </div>
    </div>
  );
};
