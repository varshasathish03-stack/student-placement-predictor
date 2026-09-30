import React, { useState, useEffect } from 'react';
import { fetchRoadmap, fetchRoles } from '../api';
import type { RoadmapResponse, JobRole } from '../types';
import { Clock } from 'lucide-react';

interface CareerRoadmapProps {
  selectedSkills: string[];
  selectedRoleId: string;
  setSelectedRoleId: (roleId: string) => void;
}

export const CareerRoadmap: React.FC<CareerRoadmapProps> = ({
  selectedSkills,
  selectedRoleId,
  setSelectedRoleId,
}) => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles().then((data) => setRoles(data.roles));
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      setLoading(true);
      fetchRoadmap(selectedSkills, selectedRoleId)
        .then((res) => setRoadmap(res))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedSkills, selectedRoleId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Career Learning Roadmap</h1>
          <p style={{ color: '#9ca3af' }}>
            Personalized step-by-step curriculum to bridge identified skill gaps.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Target Role:</label>
          <select
            className="form-select"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            style={{ width: '220px' }}
          >
            {roles.map((r) => (
              <option key={r.role_id} value={r.role_id}>
                {r.role_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p style={{ color: '#9ca3af' }}>Generating roadmap schedule...</p>}

      {roadmap && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary Box */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>Curriculum Schedule</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{roadmap.role_name} Mastery Plan</h2>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  Targeted learning steps based on your current skillset ({roadmap.current_skills.join(', ') || 'None'}).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{roadmap.roadmap.length}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Milestone Steps</div>
                </div>

                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>{roadmap.total_weeks} Wks</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Est. Duration</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {roadmap.roadmap.map((item) => (
              <div
                key={item.step}
                className="card"
                style={{
                  borderLeft: '4px solid #6366f1',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                      {item.step}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f9fafb' }}>{item.skill}</h3>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.category}</div>
                    </div>
                  </div>

                  <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> {item.estimated_weeks} {item.estimated_weeks === 1 ? 'Week' : 'Weeks'}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>{item.description}</p>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.4rem' }}>
                    Core Topics & Concepts:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {item.topics.map((t, i) => (
                      <span key={i} style={{ backgroundColor: '#111827', color: '#9ca3af', border: '1px solid #374151', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                        • {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
