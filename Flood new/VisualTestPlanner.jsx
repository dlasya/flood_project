import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function VisualTestPlanner() {
  console.log('VisualTestPlanner component mounted!');
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [step, setStep] = useState(1);

  // Hardcoded test data
  const testIssue = {
    id: 'issue_20260426_210000',
    issue_type: 'drainage_blockage',
    severity: 'high',
    status: 'pending',
    description: 'severe drainage blockage causing street flooding during rain',
    pincode: '500018',
    reporter_name: 'test_user',
    created_at: '2026-04-26T21:00:00.000000'
  };

  useEffect(() => {
    console.log('useEffect triggered, step:', step);
  }, [step]);

  const loadHardcodedData = () => {
    console.log('Loading hardcoded data...');
    setIssues([testIssue]);
    console.log('Hardcoded issues set:', [testIssue]);
    setStep(2);
  };

  const loadAPIData = async () => {
    console.log('Loading API data...');
    try {
      const response = await fetch('http://localhost:5001/api/issues/district/Telangana/Hyderabad');
      const data = await response.json();
      console.log('API response:', data);
      if (data.success) {
        setIssues(data.issues);
        console.log('API issues set:', data.issues);
        setStep(3);
      }
    } catch (error) {
      console.error('API error:', error);
    }
  };

  const clearData = () => {
    console.log('Clearing data...');
    setIssues([]);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e3f2fd] p-8">
      {/* Header */}
      <header className="bg-[#1a237e] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Visual Test Planner</h1>
                <p className="text-[#bbdefb] text-sm">Step {step}</p>
              </div>
            </div>
            <Button onClick={() => navigate('/')} variant="ghost" className="text-white hover:bg-white/10">
              <LogOut className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#0d1b2a] mb-4">Control Panel</h2>
          <div className="flex gap-4">
            <Button onClick={loadHardcodedData}>Load Hardcoded Data</Button>
            <Button onClick={loadAPIData}>Load API Data</Button>
            <Button onClick={clearData} variant="outline">Clear Data</Button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#0d1b2a] mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Current Step:</strong> {step}</p>
            <p><strong>Issues Count:</strong> {issues.length}</p>
            <p><strong>Issues Array:</strong> {JSON.stringify(issues, null, 2)}</p>
          </div>
        </div>

        {/* Issues Display */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[#e3f2fd]">
            <h2 className="text-xl font-bold text-[#0d1b2a]">
              Issues Display ({issues.length})
            </h2>
          </div>
          
          {issues.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#64748b]">No issues to display. Click buttons above to load data.</p>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#0d1b2a] mb-4">Issues Found:</h3>
              {issues.map((issue, index) => (
                <div key={issue.id || index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-[#0d1b2a] mb-2">
                    Issue #{index + 1}: {issue.issue_type?.replace('_', ' ') || 'Unknown'}
                  </h4>
                  <p className="text-[#64748b] mb-2">{issue.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-[#64748b]">Severity:</p>
                      <p className="font-semibold text-[#0d1b2a]">{issue.severity}</p>
                    </div>
                    <div>
                      <p className="text-[#64748b]">Status:</p>
                      <p className="font-semibold text-[#0d1b2a]">{issue.status}</p>
                    </div>
                    <div>
                      <p className="text-[#64748b]">Pincode:</p>
                      <p className="font-semibold text-[#0d1b2a]">{issue.pincode}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
