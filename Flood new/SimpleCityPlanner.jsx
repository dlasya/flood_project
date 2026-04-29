import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, MapPin, CheckCircle, Clock, AlertTriangle, Search, Filter, ChevronDown, LogOut, Building, FileText, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const states = ['Andhra Pradesh', 'Telangana'];
const districts = {
  'Andhra Pradesh': ['Anantapur', 'Nellore', 'Krishna'],
  'Telangana': ['Hyderabad', 'Rangareddy', 'Medak']
};

export default function SimpleCityPlanner() {
  console.log('SimpleCityPlanner component mounted!');
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
        alert(`Found ${data.issues.length} issues for ${selectedDistrict}`);
      } else {
        console.error('Failed to fetch issues:', data.error);
        alert('Failed to fetch issues: ' + data.error);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
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
                <h1 className="text-2xl font-bold">City Planner Portal</h1>
                <p className="text-[#bbdefb] text-sm">Simple Version</p>
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
        {/* Location Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#0d1b2a] mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#1565c0]" />
            Select District
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#64748b] mb-2">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#64748b] mb-2">District</label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {selectedState && districts[selectedState]?.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[#e3f2fd]">
            <h2 className="text-xl font-bold text-[#0d1b2a] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#1565c0]" />
              Reported Issues ({issues.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-[#1565c0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#64748b]">Loading issues...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-[#e3f2fd] mx-auto mb-4" />
              <p className="text-[#64748b]">
                {selectedState && selectedDistrict 
                  ? 'No issues found for this district' 
                  : 'Please select a state and district to view issues'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#e3f2fd]">
              {console.log('Rendering issues array:', issues, 'Length:', issues.length) || issues.map((issue) => (
                <div key={issue.id} className="p-6 hover:bg-[#f8fafc] transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Issue Details */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-50 text-yellow-600 border-yellow-200">
                            {issue.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-orange-50 text-orange-600 border-orange-200">
                            {issue.severity}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-[#0d1b2a] mb-2 capitalize">
                        {issue.issue_type.replace('_', ' ')}
                      </h3>
                      
                      <p className="text-[#64748b] mb-3">{issue.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-[#64748b]">Pincode</p>
                          <p className="font-semibold text-[#0d1b2a]">{issue.pincode}</p>
                        </div>
                        <div>
                          <p className="text-[#64748b]">Reporter</p>
                          <p className="font-semibold text-[#0d1b2a]">{issue.reporter_name}</p>
                        </div>
                        <div>
                          <p className="text-[#64748b]">Severity</p>
                          <p className="font-semibold text-[#0d1b2a]">{issue.severity}</p>
                        </div>
                        <div>
                          <p className="text-[#64748b]">Reported</p>
                          <p className="font-semibold text-[#0d1b2a]">
                            {new Date(issue.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
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
