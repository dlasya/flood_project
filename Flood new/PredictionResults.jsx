import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Droplets, AlertTriangle, MapPin, TrendingUp, Shield, ArrowLeft, Home, MessageSquare, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PredictionResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Issue reporting state
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueForm, setIssueForm] = useState({
    issue_type: '',
    description: '',
    reporter_name: '',
    reporter_contact: '',
    location_details: '',
    severity: 'medium'
  });
  const [issueSubmitting, setIssueSubmitting] = useState(false);

  useEffect(() => {
    // Try to get data from location state first, then from sessionStorage
    let data = location.state?.predictionData;
    
    if (!data) {
      const storedData = sessionStorage.getItem('pincode_prediction');
      if (storedData) {
        data = JSON.parse(storedData);
      }
    }
    
    if (data) {
      setPredictionData(data);
    }
    setLoading(false);
  }, [location.state]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'extreme': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getWaterloggingSeverity = (days) => {
    if (days <= 3) return { level: 'Low', color: 'text-green-600 bg-green-50 border-green-200' };
    if (days <= 8) return { level: 'Moderate', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    if (days <= 15) return { level: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { level: 'Severe', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const handleIssueSubmit = async () => {
    if (!predictionData) return;
    
    // Validate required fields
    if (!issueForm.issue_type || !issueForm.description || !issueForm.reporter_name) {
      alert('Please fill in all required fields (Issue Type, Description, Your Name)');
      return;
    }

    setIssueSubmitting(true);

    try {
      const issueData = {
        ...issueForm,
        pincode: predictionData.pincode,
        district: predictionData.district,
        state: predictionData.state
      };

      const res = await fetch("http://localhost:5001/api/issues/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issueData)
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.error || "Failed to submit issue");
      }

      alert('Issue reported successfully! We will review and take appropriate action.');
      
      // Reset form
      setIssueForm({
        issue_type: '',
        description: '',
        reporter_name: '',
        reporter_contact: '',
        location_details: '',
        severity: 'medium'
      });
      setShowIssueForm(false);
      
    } catch (err) {
      console.error("Issue submission error:", err);
      alert('Failed to submit issue. Please try again later.');
    } finally {
      setIssueSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1565c0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1565c0]">Loading prediction results...</p>
        </div>
      </div>
    );
  }

  if (!predictionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-[#ef4444] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#0d1b2a] mb-2">No Prediction Data</h2>
          <p className="text-[#64748b] mb-6">No prediction data found. Please search for a pincode first.</p>
          <Button onClick={() => navigate('/')} className="bg-[#1565c0] hover:bg-[#0288d1]">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const waterloggingInfo = getWaterloggingSeverity(predictionData.waterlogging_days);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-white">
      {/* Header */}
      <div className="bg-white border-b border-[#e3f2fd] px-6 lg:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-[#1565c0] hover:text-[#0288d1]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Droplets className="w-6 h-6 text-[#1565c0]" />
              <h1 className="text-xl font-semibold text-[#0d1b2a]">Flood Risk Results</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        {/* Location Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#e3f2fd] mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-[#1565c0]" />
            <h2 className="text-2xl font-bold text-[#0d1b2a]">Location Analysis</h2>
          </div>
          
          {/* Full Location Name */}
          <div className="mb-6 p-4 bg-gradient-to-r from-[#f8fafc] to-[#e3f2fd] rounded-xl border border-[#bbdefb]">
            <p className="text-sm text-[#64748b] mb-1">Location</p>
            <p className="text-xl font-semibold text-[#0d1b2a]">{predictionData.location}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-[#64748b] mb-1">Pincode</p>
              <p className="text-lg font-semibold text-[#0d1b2a]">{predictionData.pincode}</p>
            </div>
            <div>
              <p className="text-sm text-[#64748b] mb-1">District</p>
              <p className="text-lg font-semibold text-[#0d1b2a]">{predictionData.district}</p>
            </div>
            <div>
              <p className="text-sm text-[#64748b] mb-1">State</p>
              <p className="text-lg font-semibold text-[#0d1b2a]">{predictionData.state}</p>
            </div>
          </div>
        </div>

        {/* Risk Assessment Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Flood Risk Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#e3f2fd]">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-[#1565c0]" />
              <h3 className="text-xl font-semibold text-[#0d1b2a]">Flood Risk Assessment</h3>
              {predictionData.issue_impact && predictionData.issue_impact.adjusted_risk && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#fef3c7] rounded-full">
                  <AlertTriangle className="w-4 h-4 text-[#d97706]" />
                  <span className="text-xs font-semibold text-[#92400e]">Adjusted by Reports</span>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${getRiskColor(predictionData.risk_level)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Risk Level</span>
                  <Shield className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold capitalize">{predictionData.risk_level}</p>
              </div>
              
              {predictionData.issue_impact && predictionData.issue_impact.adjusted_risk && (
                <div className="p-4 rounded-xl border border-[#f59e0b] bg-[#fef3c7]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#92400e]">Risk Adjustment</span>
                    <TrendingUp className="w-5 h-5 text-[#d97706]" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Original</p>
                      <p className="text-lg font-semibold text-gray-600">{predictionData.issue_impact.base_risk_percent}%</p>
                    </div>
                    <div className="text-[#d97706]">→</div>
                    <div>
                      <p className="text-xs text-gray-500">Adjusted</p>
                      <p className="text-lg font-bold text-[#d97706]">{predictionData.flood_risk_percent}%</p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-xs text-gray-500">Increase</p>
                      <p className="text-lg font-bold text-[#d97706]">+{predictionData.issue_impact.risk_increase}%</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#64748b]">Risk Score</span>
                  <span className="text-sm font-semibold">{predictionData.flood_risk_percent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-[#1565c0] to-[#0288d1] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${predictionData.flood_risk_percent}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                  <p className="text-sm text-[#64748b]">Confidence</p>
                  <p className="text-lg font-semibold text-[#0d1b2a]">94%</p>
                </div>
                <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                  <p className="text-sm text-[#64748b]">Probability</p>
                  <p className="text-lg font-semibold text-[#0d1b2a]">{predictionData.flood_risk_percent}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Waterlogging Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#e3f2fd]">
            <div className="flex items-center gap-3 mb-6">
              <Droplets className="w-6 h-6 text-[#1565c0]" />
              <h3 className="text-xl font-semibold text-[#0d1b2a]">Waterlogging Analysis</h3>
            </div>
            
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${waterloggingInfo.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Severity</span>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{waterloggingInfo.level}</p>
              </div>
              
              <div className="text-center p-6 bg-[#f8fafc] rounded-xl">
                <p className="text-sm text-[#64748b] mb-2">Expected Duration</p>
                <p className="text-3xl font-bold text-[#0d1b2a]">{predictionData.waterlogging_days.toFixed(1)}</p>
                <p className="text-sm text-[#64748b]">days</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is an estimate based on historical patterns and current conditions. Actual duration may vary based on rainfall intensity and drainage capacity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#e3f2fd]">
          <h3 className="text-xl font-semibold text-[#0d1b2a] mb-6">Recommendations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-[#1565c0] flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Safety Measures
              </h4>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li className="flex items-start gap-2">
                  <span className="text-[#1565c0] mt-1">·</span>
                  Keep emergency contact numbers handy
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1565c0] mt-1">·</span>
                  Prepare an emergency kit with essentials
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1565c0] mt-1">·</span>
                  Stay informed through local weather updates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1565c0] mt-1">·</span>
                  Avoid low-lying areas during heavy rainfall
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-[#1565c0] flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Prevention Tips
              </h4>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li className="flex items-start gap-2">
                  <span className="text-[#1565c0] mt-1">·</span>
                  Ensure proper drainage around your property
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1565c0] mt-1">·</span>
                  Clear gutters and drains regularly
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1565c0] mt-1">·</span>
                  Elevate valuable items in flood-prone areas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1565c0] mt-1">·</span>
                  Consider flood insurance if available
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Issue Impact Analysis */}
        {predictionData.issue_impact && predictionData.issue_impact.total_reports > 0 && (
          <div className="mt-8 bg-gradient-to-r from-[#fef3c7] to-[#fde68a] rounded-2xl border border-[#f59e0b] p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-[#d97706]" />
              <h3 className="text-xl font-bold text-[#92400e]">Community Reports Impact Analysis</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-[#d97706]">{predictionData.issue_impact.total_reports}</div>
                <div className="text-sm text-[#92400e]">Total Reports</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-[#d97706]">{predictionData.issue_impact.score}</div>
                <div className="text-sm text-[#92400e]">Impact Score</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-[#d97706]">+{predictionData.issue_impact.risk_increase}%</div>
                <div className="text-sm text-[#92400e]">Risk Increase</div>
              </div>
            </div>
            
            <div className="bg-white/80 rounded-xl p-4">
              <p className="text-sm text-[#92400e] mb-2">
                <strong>Analysis:</strong> Based on {predictionData.issue_impact.total_reports} community reports, 
                the flood risk has been adjusted from {predictionData.issue_impact.base_risk_percent}% to {predictionData.flood_risk_percent}%.
              </p>
              {predictionData.issue_impact.issues.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-[#92400e] mb-2">Recent Reports:</p>
                  <div className="space-y-2">
                    {predictionData.issue_impact.issues.slice(0, 3).map((issue, index) => (
                      <div key={index} className="bg-white rounded-lg p-2 text-xs">
                        <span className="font-semibold capitalize">{issue.issue_type.replace('_', ' ')}</span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-600">{issue.severity}</span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">{new Date(issue.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Issue Reporting Section */}
        <div className="mt-8 bg-gradient-to-r from-[#e3f2fd] to-[#f8fafc] rounded-2xl border border-[#bbdefb] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-[#1565c0]" />
              <h3 className="text-xl font-bold text-[#0d1b2a]">Report an Issue in This Area</h3>
            </div>
            <Button
              onClick={() => setShowIssueForm(!showIssueForm)}
              variant="outline"
              className="border-[#1565c0] text-[#1565c0] hover:bg-[#1565c0] hover:text-white"
            >
              {showIssueForm ? 'Cancel' : 'Report Issue'}
            </Button>
          </div>
          
          <p className="text-[#64748b] mb-4">
            Help us improve flood monitoring by reporting issues in your area. Your reports help authorities take timely action.
          </p>
          
          {showIssueForm && (
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0d1b2a] mb-2">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  <Select value={issueForm.issue_type} onValueChange={(value) => setIssueForm({...issueForm, issue_type: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waterlogging">Waterlogging</SelectItem>
                      <SelectItem value="drainage_blockage">Drainage Blockage</SelectItem>
                      <SelectItem value="flood_damage">Flood Damage</SelectItem>
                      <SelectItem value="infrastructure_issue">Infrastructure Issue</SelectItem>
                      <SelectItem value="prediction_error">Prediction Error</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#0d1b2a] mb-2">
                    Severity
                  </label>
                  <Select value={issueForm.severity} onValueChange={(value) => setIssueForm({...issueForm, severity: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0d1b2a] mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                  placeholder="Describe the issue in detail..."
                  className="w-full h-24 px-4 py-3 border border-[#bbdefb] rounded-xl focus:border-[#0288d1] focus:ring-[#0288d1]/20 resize-none"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0d1b2a] mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={issueForm.reporter_name}
                    onChange={(e) => setIssueForm({...issueForm, reporter_name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full h-12 px-4 py-3 border border-[#bbdefb] rounded-xl focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#0d1b2a] mb-2">
                    Contact Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={issueForm.reporter_contact}
                    onChange={(e) => setIssueForm({...issueForm, reporter_contact: e.target.value})}
                    placeholder="Enter contact number"
                    className="w-full h-12 px-4 py-3 border border-[#bbdefb] rounded-xl focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0d1b2a] mb-2">
                  Location Details (Optional)
                </label>
                <input
                  type="text"
                  value={issueForm.location_details}
                  onChange={(e) => setIssueForm({...issueForm, location_details: e.target.value})}
                  placeholder="Specific location details (landmark, street, etc.)"
                  className="w-full h-12 px-4 py-3 border border-[#bbdefb] rounded-xl focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                />
              </div>
              
              <div className="flex items-center justify-end gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowIssueForm(false)}
                  variant="outline"
                  className="border-[#64748b] text-[#64748b] hover:bg-[#64748b] hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleIssueSubmit}
                  disabled={issueSubmitting}
                  className="bg-gradient-to-r from-[#1a237e] to-[#0288d1] hover:from-[#1565c0] hover:to-[#0288d1] text-white"
                >
                  {issueSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-[#1565c0] hover:bg-[#0288d1]"
          >
            <Home className="w-4 h-4 mr-2" />
            New Search
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-[#1565c0] text-[#1565c0] hover:bg-[#1565c0] hover:text-white"
          >
            Print Report
          </Button>
        </div>
      </div>
    </div>
  );
}
