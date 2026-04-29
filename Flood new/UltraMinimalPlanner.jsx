import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UltraMinimalPlanner() {
  console.log('UltraMinimalPlanner component LOADED!');
  const navigate = useNavigate();
  
  // Hardcoded issue data for immediate display
  const issue = {
    id: 'issue_20260426_210000',
    issue_type: 'drainage_blockage',
    severity: 'high',
    status: 'in_progress',
    description: 'severe drainage blockage causing street flooding during rain',
    pincode: '500018',
    reporter_name: 'test_user',
    created_at: '2026-04-26T21:00:00.000000',
    location_details: 'Near KPHB metro station'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1a237e', color: 'white', padding: '20px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>City Planner Portal - Ultra Minimal</h1>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            backgroundColor: 'transparent', 
            color: 'white', 
            border: '1px solid white', 
            padding: '10px 20px', 
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Back to Home
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Issue Display */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0d1b2a' }}>
            Reported Issues (1)
          </h2>
          
          {/* Issue Card */}
          <div style={{ 
            border: '2px solid #e3f2fd', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '20px',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <span style={{ 
                backgroundColor: '#fef3c7', 
                color: '#92400e', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px',
                fontWeight: 'bold',
                marginRight: '10px'
              }}>
                {issue.status}
              </span>
              <span style={{ 
                backgroundColor: '#fed7aa', 
                color: '#9a3412', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {issue.severity}
              </span>
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#0d1b2a' }}>
              Issue #{1}: {issue.issue_type.replace('_', ' ')}
            </h3>
            
            <p style={{ color: '#64748b', marginBottom: '15px', lineHeight: '1.5' }}>
              {issue.description}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Pincode</p>
                <p style={{ fontWeight: 'bold', color: '#0d1b2a' }}>{issue.pincode}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Reporter</p>
                <p style={{ fontWeight: 'bold', color: '#0d1b2a' }}>{issue.reporter_name}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Severity</p>
                <p style={{ fontWeight: 'bold', color: '#0d1b2a' }}>{issue.severity}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Reported</p>
                <p style={{ fontWeight: 'bold', color: '#0d1b2a' }}>
                  {new Date(issue.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {issue.location_details && (
              <div style={{ marginTop: '15px' }}>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Location</p>
                <p style={{ fontWeight: 'bold', color: '#0d1b2a' }}>{issue.location_details}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Debug Info */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#0d1b2a' }}>
            Debug Information
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            This is an ultra-minimal version with hardcoded data. If you can see this issue card, 
            then the rendering logic works and the issue was in the previous components' complexity.
          </p>
        </div>
      </div>
    </div>
  );
}
