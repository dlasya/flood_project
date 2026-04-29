import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function TestAPI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing API call...');
      const response = await fetch('http://localhost:5001/api/issues/district/Telangana/Hyderabad');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);
      setData(result);
    } catch (error) {
      console.error('API error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e3f2fd] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0d1b2a] mb-6">API Connection Test</h1>
        
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <Button onClick={testAPI} disabled={loading} className="mb-4">
            {loading ? 'Testing...' : 'Test Hyderabad API'}
          </Button>
          
          {loading && <p className="text-[#64748b]">Testing API connection...</p>}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 font-semibold">Error: {error}</p>
            </div>
          )}
          
          {data && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold mb-2">✅ API Success!</h3>
              <p className="text-sm text-green-700 mb-2">
                Found {data.issues?.length || 0} issues in Hyderabad
              </p>
              {data.issues?.length > 0 && (
                <div className="text-sm text-green-700">
                  <p><strong>Issue Type:</strong> {data.issues[0].issue_type}</p>
                  <p><strong>Severity:</strong> {data.issues[0].severity}</p>
                  <p><strong>Description:</strong> {data.issues[0].description}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-[#0d1b2a] mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Backend URL:</strong> http://localhost:5001</p>
            <p><strong>Frontend URL:</strong> http://localhost:5173</p>
            <p><strong>Test Endpoint:</strong> /api/issues/district/Telangana/Hyderabad</p>
            <p><strong>Expected:</strong> 1 high-severity drainage issue</p>
          </div>
        </div>
      </div>
    </div>
  );
}
