import React, { useState } from 'react';
import { predictPlacement } from '../api';
import type { StudentInput, PredictionResponse } from '../types';
import { Target, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

export const PlacementPredictor: React.FC = () => {
  const [formData, setFormData] = useState<StudentInput>({
    gender: 'M',
    ssc_p: 75.0,
    ssc_b: 'Central',
    hsc_p: 72.0,
    hsc_b: 'Central',
    hsc_s: 'Commerce',
    degree_p: 70.0,
    degree_t: 'Comm&Mgmt',
    workex: 'Yes',
    etest_p: 80.0,
    specialisation: 'Mkt&Fin',
    mba_p: 68.0,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictPlacement(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error executing model prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Placement Predictor</h1>
        <p style={{ color: '#9ca3af' }}>
          Input academic scores and background details to compute actual model placement probability.
        </p>
      </div>

      <div className="grid-2">
        {/* Input Form */}
        <div className="card">
          <div className="card-title">Academic & Profile Input</div>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">10th Percentage (ssc_p)</label>
                <input
                  type="number"
                  name="ssc_p"
                  className="form-input"
                  value={formData.ssc_p}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">10th Board (ssc_b)</label>
                <select name="ssc_b" className="form-select" value={formData.ssc_b} onChange={handleChange}>
                  <option value="Central">Central</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">12th Percentage (hsc_p)</label>
                <input
                  type="number"
                  name="hsc_p"
                  className="form-input"
                  value={formData.hsc_p}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">12th Stream (hsc_s)</label>
                <select name="hsc_s" className="form-select" value={formData.hsc_s} onChange={handleChange}>
                  <option value="Commerce">Commerce</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Degree Percentage (degree_p)</label>
                <input
                  type="number"
                  name="degree_p"
                  className="form-input"
                  value={formData.degree_p}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Degree Type (degree_t)</label>
                <select name="degree_t" className="form-select" value={formData.degree_t} onChange={handleChange}>
                  <option value="Comm&Mgmt">Comm & Mgmt</option>
                  <option value="Sci&Tech">Sci & Tech</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Work Experience (workex)</label>
                <select name="workex" className="form-select" value={formData.workex} onChange={handleChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Employability Test Score (etest_p)</label>
                <input
                  type="number"
                  name="etest_p"
                  className="form-input"
                  value={formData.etest_p}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">MBA Specialization</label>
                <select name="specialisation" className="form-select" value={formData.specialisation} onChange={handleChange}>
                  <option value="Mkt&Fin">Mkt & Fin</option>
                  <option value="Mkt&HR">Mkt & HR</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">MBA Percentage (mba_p)</label>
                <input
                  type="number"
                  name="mba_p"
                  className="form-input"
                  value={formData.mba_p}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-emerald" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              <Cpu size={18} />
              {loading ? 'Evaluating Model...' : 'Calculate Placement Probability'}
            </button>
          </form>
        </div>

        {/* Output Results Card */}
        <div className="card">
          <div className="card-title">Prediction & Model Insights</div>

          {error && (
            <div style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {!result && !error && (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
              <Target size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Fill in the academic parameters and click <strong>Calculate Placement Probability</strong> to get real ML output.</p>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Status Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#111827', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>MODEL OUTCOME</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
                    {result.prediction === 'Placed' ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={24} /> High Placement Likelihood
                      </span>
                    ) : (
                      <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={24} /> Low Placement Probability
                      </span>
                    )}
                  </div>
                </div>

                <div className={`badge ${result.prediction === 'Placed' ? 'badge-placed' : 'badge-unplaced'}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  {result.prediction}
                </div>
              </div>

              {/* Probability Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span>Probability Score</span>
                  <span style={{ color: result.probability >= 0.5 ? '#10b981' : '#ef4444' }}>
                    {(result.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${result.probability * 100}%`,
                      backgroundColor: result.probability >= 0.5 ? '#10b981' : '#ef4444',
                    }}
                  />
                </div>
              </div>

              {/* Feature Impact List */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f9fafb' }}>
                  Factors Contributing to Prediction
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {result.explanation.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0.85rem',
                        backgroundColor: '#1f2937',
                        borderRadius: '6px',
                        borderLeft: `4px solid ${item.impact >= 0 ? '#10b981' : '#ef4444'}`,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.feature}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.description}</div>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: item.impact >= 0 ? '#10b981' : '#ef4444' }}>
                        {item.impact >= 0 ? `+${item.impact}` : item.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
