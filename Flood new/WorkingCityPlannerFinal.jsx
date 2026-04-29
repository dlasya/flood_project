import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorkingCityPlannerFinal() {
  console.log('WorkingCityPlannerFinal component LOADED!');
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const states = ['Andhra Pradesh', 'Telangana'];
  const districts = {
    'Andhra Pradesh': ['Anantapur', 'Nellore', 'Krishna'],
    'Telangana': ['Hyderabad', 'Rangareddy', 'Medak']
  };

  useEffect(() => {
    console.log('useEffect triggered:', { selectedState, selectedDistrict });
    if (selectedState && selectedDistrict) {
      fetchDistrictIssues();
    }
  }, [selectedState, selectedDistrict]);

  const fetchDistrictIssues = async () => {
    setLoading(true);
    try {
      console.log('Fetching issues for:', selectedState, selectedDistrict);
      const url = `http://localhost:5001/api/issues/district/${selectedState}/${selectedDistrict}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setIssues(data.issues);
        console.log('Issues loaded:', data.issues.length);
        console.log('Issues array:', data.issues);
      } else {
        console.error('Failed to fetch issues:', data.error);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1a237e', color: 'white', padding: '20px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>City Planner Portal</h1>
        <p style={{ fontSize: '14px', margin: '5px 0', color: '#bbdefb' }}>Final Working Version</p>
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
        {/* Location Selection */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0d1b2a' }}>
            Select District
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>State</label>
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select state</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>District</label>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedState}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: selectedState ? 'white' : '#f9fafb'
                }}
              >
                <option value="">Select district</option>
                {selectedState && districts[selectedState]?.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e3f2fd' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d1b2a' }}>
              Reported Issues ({issues.length})
            </h2>
          </div>
          
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                border: '4px solid #e3f2fd', 
                borderTop: '4px solid #1565c0', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#64748b' }}>Loading issues...</p>
            </div>
          ) : (
            <div style={{ padding: '20px' }}>
              {issues.length === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#64748b' }}>
                    {selectedState && selectedDistrict 
                      ? 'No issues found for this district' 
                      : 'Please select a state and district to view issues'}
                  </p>
                </div>
              ) : (
                <div>
                  {issues.map((issue, index) => (
                    <div key={issue.id || index} style={{ 
                      border: '2px solid #e3f2fd', 
                      borderRadius: '8px', 
                      padding: '20px', 
                      marginBottom: '16px',
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
                        Issue #{index + 1}: {issue.issue_type?.replace('_', ' ') || 'Unknown Issue'}
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
                      
                      {issue.status_notes && (
                        <div style={{ marginTop: '15px' }}>
                          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Status Notes</p>
                          <p style={{ fontWeight: 'bold', color: '#0d1b2a' }}>{issue.status_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
