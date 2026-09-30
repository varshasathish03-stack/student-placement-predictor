import React, { useState, useEffect } from 'react';
import { fetchRoles } from '../api';
import type { JobRole } from '../types';
import { DollarSign } from 'lucide-react';

interface JobRoleExplorerProps {
  setActiveTab: (tab: string) => void;
  setSelectedRoleForRoadmap: (roleId: string) => void;
}

export const JobRoleExplorer: React.FC<JobRoleExplorerProps> = ({
  setActiveTab,
  setSelectedRoleForRoadmap,
}) => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRoles().then((data) => setRoles(data.roles));
  }, []);

  const filteredRoles = roles.filter(
    (r) =>
      r.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleForRoadmap(roleId);
    setActiveTab('skills');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Job Role Catalogue</h1>
          <p style={{ color: '#9ca3af' }}>
            Explore technical career paths, required skills, and salary benchmarks.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search role or skill..."
          className="form-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '280px' }}
        />
      </div>

      <div className="grid-3">
        {filteredRoles.map((role) => (
          <div key={role.role_id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb' }}>{role.role_name}</h3>
                <span className="badge badge-info">{role.demand_level} Demand</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1rem', minHeight: '40px' }}>
                {role.description}
              </p>

              <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <DollarSign size={16} /> Est. Salary: {role.average_salary_range}
              </div>

              {/* Required Skills */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Required Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {role.required_skills.map((skill) => (
                    <span key={skill} style={{ backgroundColor: '#1f2937', color: '#f3f4f6', border: '1px solid #374151', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleSelectRole(role.role_id)}>
              Analyze Skills for {role.role_name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
