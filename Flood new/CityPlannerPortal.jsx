import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, MapPin, CheckCircle, Clock, AlertTriangle, Search, Filter, ChevronDown, LogOut, Building, FileText, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const states = [
  'Andhra Pradesh', 'Telangana'
];

const districts = {
  'Andhra Pradesh': [
    'Nellore', 'Krishna', 'Kurnool', 'Kadapa', 'East Godavari', 'Guntur',
    'Visakhapatnam', 'Anantapur', 'Anakapalli', 'Bapatla', 'Konaseema',
    'Parvathipuram Manyam', 'Sri Sathya Sai', 'Tirupati', 'Vizianagaram',
    'West Godavari', 'Eluru'
  ],
  'Telangana': [
    'Rangareddy', 'Hyderabad', 'Hanamkonda', 'Jangaon', 'Jagtial', 'Gadwal',
    'Kumuram Bheem', 'Jayashankar Bhupalpally', 'Karimnagar', 'Mahabubnagar',
    'Adilabad', 'Bhadradri Kothagudem', 'Kamareddy', 'Khammam', 'Mahabubabad',
    'Mancherial', 'Medak', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet',
    'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Sangareddy',
    'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal',
    'Yadadri Bhuvanagiri', 'Medchal Malkajgiri'
  ]
};

export default function CityPlannerPortal() {
  console.log('City Planner Portal component loaded');
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingIssue, setUpdatingIssue] = useState(null);

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
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setIssues(data.issues);
        setStats(data.stats);
        console.log('Issues loaded:', data.issues.length);
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

  const updateIssueStatus = async (issueId, newStatus, notes = '') => {
    setUpdatingIssue(issueId);
    try {
      const response = await fetch(`http://localhost:5001/api/issues/${issueId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update local state
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? { ...issue, ...data.issue } : issue
        ));
        
        // Update stats
        fetchDistrictIssues();
      } else {
        alert('Failed to update issue status');
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Failed to update issue status');
    } finally {
      setUpdatingIssue(null);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
    const matchesSearch = searchTerm === '' || 
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.issue_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.pincode.includes(searchTerm);
    
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'solved': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e3f2fd]">
      {/* Header */}
      <header className="bg-[#1a237e] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">City Planner Portal</h1>
                <p className="text-[#bbdefb] text-sm">FloodSense Issue Management System</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-white/10">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
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

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-[#e3f2fd]">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#1565c0]" />
                <div>
                  <p className="text-2xl font-bold text-[#0d1b2a]">{stats.total}</p>
                  <p className="text-sm text-[#64748b]">Total Reports</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-[#e3f2fd]">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-[#0d1b2a]">{stats.pending}</p>
                  <p className="text-sm text-[#64748b]">Pending</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-[#e3f2fd]">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-[#0d1b2a]">{stats.in_progress}</p>
                  <p className="text-sm text-[#64748b]">In Progress</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-[#e3f2fd]">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-[#0d1b2a]">{stats.solved}</p>
                  <p className="text-sm text-[#64748b]">Solved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        {issues.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
                  <input
                    type="text"
                    placeholder="Search by description, type, or pincode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#e3f2fd] rounded-xl focus:border-[#1565c0] focus:ring-[#1565c0]/20"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Issues List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[#e3f2fd]">
            <h2 className="text-xl font-bold text-[#0d1b2a] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#1565c0]" />
              Reported Issues ({filteredIssues.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-[#1565c0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#64748b]">Loading issues...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-[#e3f2fd] mx-auto mb-4" />
              <p className="text-[#64748b]">
                {selectedState && selectedDistrict 
                  ? 'No issues found for the selected filters' 
                  : 'Please select a state and district to view issues'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#e3f2fd]">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="p-6 hover:bg-[#f8fafc] transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Issue Details */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(issue.status)}`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(issue.severity)}`}>
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
                          <p className="text-[#64748b]">Contact</p>
                          <p className="font-semibold text-[#0d1b2a]">{issue.reporter_contact || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[#64748b]">Reported</p>
                          <p className="font-semibold text-[#0d1b2a]">
                            {new Date(issue.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {issue.location_details && (
                        <div className="mt-3 p-3 bg-[#f8fafc] rounded-lg">
                          <p className="text-sm text-[#64748b]">Location Details:</p>
                          <p className="text-sm font-medium text-[#0d1b2a]">{issue.location_details}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {issue.status !== 'solved' && (
                        <>
                          {issue.status === 'pending' && (
                            <Button
                              onClick={() => updateIssueStatus(issue.id, 'in_progress')}
                              disabled={updatingIssue === issue.id}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              {updatingIssue === issue.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                'Mark In Progress'
                              )}
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => updateIssueStatus(issue.id, 'solved')}
                            disabled={updatingIssue === issue.id}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {updatingIssue === issue.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              'Mark as Solved'
                            )}
                          </Button>
                        </>
                      )}
                      
                      {issue.status === 'solved' && (
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-green-600">Resolved</p>
                        </div>
                      )}
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
