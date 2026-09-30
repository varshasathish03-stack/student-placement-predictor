import React, { useState, useEffect } from 'react';
import { fetchPredictionHistory } from '../api';
import type { PredictionRecord } from '../types';
import { History } from 'lucide-react';

export const PredictionHistory: React.FC = () => {
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictionHistory()
      .then((data) => setHistory(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Prediction Audit History</h1>
        <p style={{ color: '#9ca3af' }}>
          Historical record of all model queries persisted in the backend database.
        </p>
      </div>

      <div className="card">
        {loading && <p style={{ color: '#9ca3af' }}>Loading history records...</p>}

        {!loading && history.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
            <History size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No predictions recorded yet. Run a prediction in the Placement Predictor tab!</p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Outcome</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Probability</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Academic Profile (10th / 12th / Deg / MBA)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Model Version</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #1f2937', color: '#f3f4f6' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${item.prediction === 'Placed' ? 'badge-placed' : 'badge-unplaced'}`}>
                        {item.prediction}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: item.probability >= 0.5 ? '#10b981' : '#ef4444' }}>
                      {(item.probability * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#d1d5db', fontSize: '0.85rem' }}>
                      {item.inputs ? `${item.inputs.ssc_p}% / ${item.inputs.hsc_p}% / ${item.inputs.degree_p}% / ${item.inputs.mba_p}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                      {item.model_version}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
