import { useState, useEffect } from 'react';
import { 
  Droplets, LogOut, Menu, X, Map, BarChart3, 
  Zap, FileText, ChevronDown, ChevronUp,
  CloudRain, Mountain, Layers, Gauge, MapPin, Activity,
  TrendingUp, AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from 'react-router-dom';
import SimulationResults from "@/components/SimulationResults";

// Card data for all Indian states (synthetic summary stats)
const STATE_CARDS = [
  { name: "Andhra Pradesh", zone: "South", risk: "High", rainfall: 930, events: 28, soil: "Alluvial / Red loam", drainage: "Deltaic rivers, medium drainage" },
  { name: "Arunachal Pradesh", zone: "North East", risk: "High", rainfall: 2800, events: 20, soil: "Mountain forest soils", drainage: "Steep, flashy mountain rivers" },
  { name: "Assam", zone: "North East", risk: "Extreme", rainfall: 2818, events: 52, soil: "Alluvial, floodplain soils", drainage: "Brahmaputra floodplains, low drainage" },
  { name: "Bihar", zone: "East", risk: "High", rainfall: 1326, events: 35, soil: "Gangetic alluvium", drainage: "Low-lying floodplains, sluggish drainage" },
  { name: "Chhattisgarh", zone: "Central", risk: "Moderate", rainfall: 1400, events: 18, soil: "Red and lateritic", drainage: "Plateau rivers, moderate drainage" },
  { name: "Goa", zone: "West", risk: "Moderate", rainfall: 3000, events: 10, soil: "Laterite", drainage: "Short, steep coastal rivers" },
  { name: "Gujarat", zone: "West", risk: "Low", rainfall: 832, events: 12, soil: "Alluvial / black cotton", drainage: "Mixed; arid in Kutch, estuarine along coast" },
  { name: "Haryana", zone: "North", risk: "Low", rainfall: 617, events: 7, soil: "Alluvial", drainage: "Canal-irrigated plains, engineered drainage" },
  { name: "Himachal Pradesh", zone: "North", risk: "Moderate", rainfall: 1250, events: 15, soil: "Mountain skeletal soils", drainage: "Steep Himalayan rivers" },
  { name: "Jharkhand", zone: "East", risk: "Moderate", rainfall: 1300, events: 16, soil: "Red and lateritic", drainage: "Plateau drainage, moderate response" },
  { name: "Karnataka", zone: "South", risk: "Moderate", rainfall: 1248, events: 19, soil: "Red loam / laterite", drainage: "Western Ghats steep, interior moderate" },
  { name: "Kerala", zone: "South", risk: "Extreme", rainfall: 3000, events: 45, soil: "Lateritic and alluvial", drainage: "Short steep rivers, backwaters" },
  { name: "Madhya Pradesh", zone: "Central", risk: "Low", rainfall: 1017, events: 14, soil: "Black cotton / mixed", drainage: "Plateau rivers, moderate drainage" },
  { name: "Maharashtra", zone: "West", risk: "Moderate", rainfall: 1177, events: 24, soil: "Black cotton / laterite (Konkan)", drainage: "Ghats steep, Deccan moderate" },
  { name: "Manipur", zone: "North East", risk: "High", rainfall: 2000, events: 18, soil: "Red loam", drainage: "Valley basins with moderate drainage" },
  { name: "Meghalaya", zone: "North East", risk: "Extreme", rainfall: 3000, events: 30, soil: "Lateritic", drainage: "Very steep, intense runoff" },
  { name: "Mizoram", zone: "North East", risk: "High", rainfall: 2500, events: 16, soil: "Mountain soils", drainage: "Steep, landslide-prone slopes" },
  { name: "Nagaland", zone: "North East", risk: "High", rainfall: 2000, events: 14, soil: "Mountain forest soils", drainage: "Steep hill drainage" },
  { name: "Odisha", zone: "East", risk: "Extreme", rainfall: 1489, events: 38, soil: "Coastal alluvium / laterite", drainage: "Deltaic rivers, cyclonic storm surges" },
  { name: "Punjab", zone: "North", risk: "Low", rainfall: 649, events: 8, soil: "Alluvial", drainage: "Canal and river-fed plains" },
  { name: "Rajasthan", zone: "North", risk: "Low", rainfall: 313, events: 5, soil: "Arid desert and alluvial", drainage: "Sparse drainage, flash-flood in arid zones" },
  { name: "Sikkim", zone: "North East", risk: "High", rainfall: 2200, events: 12, soil: "Mountain skeletal soils", drainage: "Very steep Himalayan catchments" },
  { name: "Tamil Nadu", zone: "South", risk: "Moderate", rainfall: 998, events: 22, soil: "Red loam / coastal alluvium", drainage: "Coastal plains, reservoirs and tanks" },
  { name: "Telangana", zone: "South", risk: "High", rainfall: 950, events: 31, soil: "Red sandy loam / black cotton", drainage: "Deccan plateau, moderate drainage" },
  { name: "Tripura", zone: "North East", risk: "High", rainfall: 2100, events: 15, soil: "Lateritic", drainage: "Rolling hills, lowland floodplains" },
  { name: "Uttar Pradesh", zone: "North", risk: "Moderate", rainfall: 990, events: 18, soil: "Gangetic alluvium", drainage: "Ganga floodplain, low gradient" },
  { name: "Uttarakhand", zone: "North", risk: "High", rainfall: 1600, events: 20, soil: "Mountain forest soils", drainage: "Steep Himalayan rivers, glacial melt" },
  { name: "West Bengal", zone: "East", risk: "Extreme", rainfall: 1582, events: 41, soil: "Alluvial / coastal saline", drainage: "Ganga-Brahmaputra delta, Sundarbans" }
];

// District cards for AP and Telangana - complete data from dataset
const DISTRICT_CARDS = {
  "Andhra Pradesh": [
    { name: "Alluri Sitharama Raju", rainfall: 1276, events: 5, waterlogDays: 9, risk: "High" },
    { name: "Anakapalli", rainfall: 1145, events: 5, waterlogDays: 10, risk: "High" },
    { name: "Anantapur", rainfall: 676, events: 5, waterlogDays: 8, risk: "Low" },
    { name: "Bapatla", rainfall: 897, events: 5, waterlogDays: 16, risk: "High" },
    { name: "Chittoor", rainfall: 877, events: 6, waterlogDays: 11, risk: "Moderate" },
    { name: "East Godavari", rainfall: 1145, events: 5, waterlogDays: 16, risk: "High" },
    { name: "Eluru", rainfall: 1080, events: 5, waterlogDays: 10, risk: "High" },
    { name: "Guntur", rainfall: 829, events: 4, waterlogDays: 7, risk: "Moderate" },
    { name: "Kadapa", rainfall: 721, events: 5, waterlogDays: 11, risk: "Moderate" },
    { name: "Konaseema", rainfall: 1368, events: 5, waterlogDays: 11, risk: "High" },
    { name: "Krishna", rainfall: 998, events: 5, waterlogDays: 5, risk: "Moderate" },
    { name: "Kurnool", rainfall: 651, events: 5, waterlogDays: 10, risk: "Moderate" },
    { name: "Nellore", rainfall: 990, events: 5, waterlogDays: 9, risk: "Moderate" },
    { name: "Parvathipuram Manyam", rainfall: 1276, events: 5, waterlogDays: 9, risk: "High" },
    { name: "Prakasam", rainfall: 803, events: 5, waterlogDays: 11, risk: "Moderate" },
    { name: "Sri Sathya Sai", rainfall: 676, events: 5, waterlogDays: 8, risk: "Low" },
    { name: "Srikakulam", rainfall: 1213, events: 5, waterlogDays: 16, risk: "High" },
    { name: "Tirupati", rainfall: 916, events: 6, waterlogDays: 16, risk: "High" },
    { name: "Visakhapatnam", rainfall: 1131, events: 5, waterlogDays: 14, risk: "High" },
    { name: "Vizianagaram", rainfall: 1107, events: 5, waterlogDays: 10, risk: "High" },
    { name: "West Godavari", rainfall: 1145, events: 6, waterlogDays: 18, risk: "High" }
  ],
  "Telangana": [
    { name: "Adilabad", rainfall: 1068, events: 5, waterlogDays: 10, risk: "High" },
    { name: "Asifabad", rainfall: 1143, events: 4, waterlogDays: 6, risk: "High" },
    { name: "Bhadradri Kothagudem", rainfall: 1299, events: 5, waterlogDays: 12, risk: "High" },
    { name: "Gadwal", rainfall: 671, events: 5, waterlogDays: 13, risk: "Moderate" },
    { name: "Hanamkonda", rainfall: 1006, events: 5, waterlogDays: 10, risk: "High" },
    { name: "Hyderabad", rainfall: 846, events: 5, waterlogDays: 11, risk: "Moderate" },
    { name: "Jagtial", rainfall: 1098, events: 6, waterlogDays: 11, risk: "High" },
    { name: "Jangaon", rainfall: 872, events: 4, waterlogDays: 12, risk: "Moderate" },
    { name: "Jayashankar Bhupalpally", rainfall: 1228, events: 5, waterlogDays: 14, risk: "High" },
    { name: "Kamareddy", rainfall: 901, events: 5, waterlogDays: 9, risk: "Moderate" },
    { name: "Karimnagar", rainfall: 900, events: 4, waterlogDays: 8, risk: "Moderate" },
    { name: "Khammam", rainfall: 1039, events: 5, waterlogDays: 17, risk: "High" },
    { name: "Kumuram Bheem", rainfall: 1575, events: 6, waterlogDays: 17, risk: "High" },
    { name: "Mahabubabad", rainfall: 1149, events: 5, waterlogDays: 12, risk: "High" },
    { name: "Mahabubnagar", rainfall: 665, events: 5, waterlogDays: 11, risk: "Moderate" },
    { name: "Mancherial", rainfall: 1179, events: 5, waterlogDays: 12, risk: "High" },
    { name: "Medak", rainfall: 980, events: 5, waterlogDays: 9, risk: "Moderate" },
    { name: "Medchal Malkajgiri", rainfall: 829, events: 5, waterlogDays: 11, risk: "Moderate" },
    { name: "Mulugu", rainfall: 1428, events: 5, waterlogDays: 12, risk: "High" },
    { name: "Nagarkurnool", rainfall: 766, events: 5, waterlogDays: 15, risk: "High" },
    { name: "Nalgonda", rainfall: 808, events: 6, waterlogDays: 10, risk: "Moderate" },
    { name: "Narayanpet", rainfall: 661, events: 5, waterlogDays: 10, risk: "Moderate" },
    { name: "Nirmal", rainfall: 1075, events: 5, waterlogDays: 10, risk: "High" },
    { name: "Nizamabad", rainfall: 976, events: 5, waterlogDays: 10, risk: "Moderate" },
    { name: "Peddapalli", rainfall: 1016, events: 5, waterlogDays: 14, risk: "High" },
    { name: "Rajanna Sircilla", rainfall: 1060, events: 5, waterlogDays: 12, risk: "High" },
    { name: "Rangareddy", rainfall: 726, events: 4, waterlogDays: 12, risk: "Moderate" },
    { name: "Sangareddy", rainfall: 887, events: 5, waterlogDays: 6, risk: "Moderate" },
    { name: "Siddipet", rainfall: 966, events: 5, waterlogDays: 12, risk: "Moderate" },
    { name: "Suryapet", rainfall: 879, events: 5, waterlogDays: 7, risk: "Moderate" },
    { name: "Vikarabad", rainfall: 896, events: 6, waterlogDays: 13, risk: "Moderate" },
    { name: "Wanaparthy", rainfall: 752, events: 5, waterlogDays: 14, risk: "Moderate" },
    { name: "Warangal", rainfall: 957, events: 5, waterlogDays: 17, risk: "High" },
    { name: "Yadadri Bhuvanagiri", rainfall: 769, events: 4, waterlogDays: 6, risk: "Low" }
  ]
};

const riskColor = (risk) => {
  switch (risk) {
    case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'High': return 'bg-red-50 text-red-700 border-red-200';
    case 'Extreme': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

// City Planner Section Component
function CityPlannerSection() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [solvedIssues, setSolvedIssues] = useState([]);

  const states = ['Andhra Pradesh', 'Telangana'];
  const districts = {
    'Andhra Pradesh': [
      'Alluri Sitharama Raju', 'Anakapalli', 'Anantapur', 'Bapatla', 'Chittoor', 
      'East Godavari', 'Eluru', 'Guntur', 'Kadapa', 'Konaseema', 'Krishna', 'Kurnool', 
      'Nellore', 'Parvathipuram Manyam', 'Prakasam', 'Sri Sathya Sai', 'Srikakulam', 
      'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari'
    ],
    'Telangana': [
      'Adilabad', 'Asifabad', 'Bhadradri Kothagudem', 'Gadwal', 'Hanamkonda', 'Hyderabad', 
      'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Kamareddy', 'Karimnagar', 'Khammam', 
      'Kumuram Bheem', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 
      'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 
      'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 
      'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
    ]
  };

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
      } else {
        console.error('Failed to fetch issues:', data.error);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const markIssueAsSolved = async (issueId) => {
    try {
      console.log('Marking issue as solved:', issueId);
      const url = `http://localhost:5001/api/issues/${issueId}/status`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'solved',
          status_notes: 'Issue resolved by City Planner'
        })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Issue marked as solved successfully');
        // Refresh the issues list
        await fetchDistrictIssues();
        alert('Issue marked as solved successfully!');
      } else {
        console.error('Failed to mark issue as solved:', data.error);
        alert('Failed to mark issue as solved: ' + data.error);
      }
    } catch (error) {
      console.error('Error marking issue as solved:', error);
      alert('Network error: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-[#e3f2fd]">
        <h2 className="text-xl font-bold text-[#0d1b2a] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#1565c0]" />
          City Planner Portal
        </h2>
      </div>
      
      {/* Location Selection */}
      <div className="p-6 border-b border-[#e3f2fd]">
        <h3 className="text-lg font-semibold text-[#0d1b2a] mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#1565c0]" />
          Select District
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#64748b] mb-2">State</label>
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-3 border border-[#d1d5db] rounded-lg"
            >
              <option value="">Select state</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#64748b] mb-2">District</label>
            <select 
              value={selectedDistrict} 
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedState}
              className="w-full p-3 border border-[#d1d5db] rounded-lg disabled:bg-[#f9fafb]"
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
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#0d1b2a] mb-4">
          Reported Issues ({issues.length})
        </h3>
        
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
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <div key={issue.id || index} className="border border-[#e3f2fd] rounded-lg p-4 bg-[#f8fafc]">
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
                
                <h4 className="text-lg font-semibold text-[#0d1b2a] mb-2 capitalize">
                  Issue #{index + 1}: {issue.issue_type?.replace('_', ' ') || 'Unknown Issue'}
                </h4>
                
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
                
                {issue.location_details && (
                  <div className="mt-3 text-sm">
                    <p className="text-[#64748b]">Location</p>
                    <p className="font-semibold text-[#0d1b2a]">{issue.location_details}</p>
                  </div>
                )}
                
                {issue.status_notes && (
                  <div className="mt-3 text-sm">
                    <p className="text-[#64748b]">Status Notes</p>
                    <p className="font-semibold text-[#0d1b2a]">{issue.status_notes}</p>
                  </div>
                )}
                
                {/* Action Button */}
                <div className="mt-4 flex justify-end">
                  {issue.status !== 'solved' ? (
                    <Button
                      onClick={() => markIssueAsSolved(issue.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Mark as Solved
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                      Issue Resolved
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlannerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Map View');
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  // Simulation parameters
  const [simParams, setSimParams] = useState({
    rainfall: 900,
    soilMoisture: 50,
    elevation: 200,
    drainageCapacity: 60,
    runoffCoefficient: 0.5,
    distanceToRiver: 10
  });

  useEffect(() => {
    const storedUser = sessionStorage.getItem('floodsense_user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    const userData = JSON.parse(storedUser);
    if (userData.type !== 'planner') {
      navigate('/UserDashboard');
      return;
    }
    setUser(userData);
  }, [navigate]);

  // Ensure the simulation panel is open whenever the Custom Simulation tab is active
  useEffect(() => {
    if (activeNav === 'Custom Simulation') {
      setSimulationOpen(true);
    }
  }, [activeNav]);

  const handleLogout = () => {
    sessionStorage.removeItem('floodsense_user');
    navigate('/');
  };

  const runSimulation = async () => {
    setSimulationLoading(true);
    try {
      // Map planner sliders into the backend input schema used by the trained model.
      // drainage_condition expects 1..5 (1=Good, 5=Poor).
      const drainageCondition = Math.max(
        1,
        Math.min(5, Math.round(5 - (simParams.drainageCapacity / 100) * 4))
      );

      const payload = {
        location_name: selectedState ? `${selectedState} (Simulation)` : "Custom Simulation",
        rainfall_intensity: simParams.rainfall,
        drainage_condition: drainageCondition,
        // soil_permeability expects 0..1. We treat higher soil moisture as lower permeability.
        soil_permeability: Math.max(0, Math.min(1, 1 - simParams.soilMoisture / 100)),
        land_use_type: 3,
        historical_flood_records: 1,
        elevation: simParams.elevation
      };

      const res = await fetch("http://localhost:5001/api/predictions/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const api = await res.json();
      if (!res.ok) {
        throw new Error(api?.error || "Simulation prediction failed");
      }

      setSimulationResults({
        flood_risk_percent: api.flood_risk_percent,
        flood_probability: api.flood_probability,
        waterlogging_days: Math.round(api.waterlogging_days),
        flood_severity: api.flood_severity,
        waterlogging_severity: api.waterlogging_severity
      });
    } catch (err) {
      console.error("Simulation API error:", err);
      alert("Failed to run simulation. Please ensure backend is running.");
    } finally {
      setSimulationLoading(false);
    }
  };

  // Summary statistics
  const totalDistricts = 33;
  const highRiskDistricts = 12;
  const avgRainfall = 940;
  const floodEventsThisYear = 8;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a237e] h-16 flex items-center justify-between px-4 lg:px-8 border-b-2 border-[#0288d1] shadow-lg">
        <div className="flex items-center gap-3">
          <Droplets className="w-8 h-8 text-white" />
          <span className="text-xl font-bold text-white hidden sm:block">FloodSense</span>
          <span className="hidden lg:inline-flex ml-2 px-3 py-1 text-xs font-medium bg-[#0288d1] text-white rounded-full">
            {user.access === 'Both States' ? 'FloodSense Admin – Both States' : `City Planner – ${user.access || 'State'}`}
          </span>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {['Map View', 'City Planner', 'Custom Simulation'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`relative text-white/80 hover:text-white transition-colors py-2 ${activeNav === item ? 'text-white' : ''}`}
            >
              {item}
              {activeNav === item && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0288d1] rounded-full" />
              )}
            </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0288d1] to-[#1565c0] flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0)}
            </div>
            <span className="text-white font-medium">{user.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-[#1a237e] border-b border-[#0288d1] lg:hidden">
          {['Map View', 'City Planner', 'Custom Simulation'].map((item) => (
            <button
              key={item}
              onClick={() => { setActiveNav(item); setMobileMenuOpen(false); }}
              className={`w-full px-6 py-4 text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors ${activeNav === item ? 'text-white bg-white/5' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-12">
        {/* Map View: card-based explorer */}
        {activeNav === 'Map View' && (
          <section className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-[#e3f2fd] flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0d1b2a]">
                      {selectedState ? `${selectedState} – District Flood Explorer` : 'India Flood Risk – State Overview'}
                    </h2>
                    <p className="text-xs text-[#64748b] mt-1">
                      {selectedState
                        ? 'Showing only districts for the selected state.'
                        : 'Click Andhra Pradesh or Telangana to drill down to district cards.'}
                    </p>
                  </div>
                  {selectedState && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSelectedState(null); setSelectedDistrict(null); }}
                      className="text-[#1565c0]"
                    >
                      Back to all states
                    </Button>
                  )}
                </div>

                {/* State cards or district cards */}
                {!selectedState && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STATE_CARDS.map((state) => (
                      <button
                        key={state.name}
                        type="button"
                        onClick={() => {
                          if (state.name === 'Andhra Pradesh' || state.name === 'Telangana') {
                            setSelectedState(state.name);
                          }
                        }}
                        className={`text-left rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
                          riskColor(state.risk)
                        } ${state.name === 'Andhra Pradesh' || state.name === 'Telangana' ? 'cursor-pointer' : 'cursor-default opacity-90'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs uppercase tracking-wide text-[#64748b]">{state.zone}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60">
                            {state.risk} risk
                          </span>
                        </div>
                        <p className="text-base font-semibold text-[#0d1b2a]">{state.name}</p>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div>
                            <p className="text-[#64748b]">Annual rainfall</p>
                            <p className="font-semibold">{state.rainfall} mm</p>
                          </div>
                          <div>
                            <p className="text-[#64748b]">Flood events / decade</p>
                            <p className="font-semibold">{state.events}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-[11px] text-[#475569] space-y-0.5">
                          <p><span className="font-semibold">Soil</span>: {state.soil}</p>
                          <p><span className="font-semibold">Drainage</span>: {state.drainage}</p>
                        </div>
                        {(state.name === 'Andhra Pradesh' || state.name === 'Telangana') && (
                          <p className="mt-2 text-xs text-[#1565c0] font-medium">
                            Click to view district-wise cards
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedState && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {DISTRICT_CARDS[selectedState]?.map((d) => (
                        <button
                          key={d.name}
                          type="button"
                          onClick={() => setSelectedDistrict(d)}
                          className={`w-full text-left rounded-2xl border p-4 shadow-sm bg-[#f8fafc] hover:bg-white transition-all hover:-translate-y-0.5 ${riskColor(d.risk)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-[#0d1b2a]">{d.name}</h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/70">
                              {d.risk} risk
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                            <div>
                              <p className="text-[#64748b]">Rainfall</p>
                              <p className="font-semibold">{d.rainfall} mm</p>
                            </div>
                            <div>
                              <p className="text-[#64748b]">Events</p>
                              <p className="font-semibold">{d.events}</p>
                            </div>
                            <div>
                              <p className="text-[#64748b]">Waterlog days</p>
                              <p className="font-semibold">{d.waterlogDays}</p>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-[#1565c0] font-medium">
                            Tap to open detailed analysis
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* District Analysis Panel - shown directly after tap */}
        {activeNav === 'Map View' && selectedState && selectedDistrict && (
          <section className="px-4 lg:px-6 py-6 bg-gradient-to-r from-[#1a237e] to-[#0288d1] animate-slideDown">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[#0d1b2a]">{selectedDistrict.name} District</h3>
                    <p className="text-[#0288d1] text-lg">{selectedState}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDistrict(null)}
                    className="border-[#1565c0] text-[#1565c0] hover:bg-[#e3f2fd]"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Close Analysis
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: CloudRain, label: 'Avg Rainfall', value: `${selectedDistrict.rainfall} mm` },
                    { icon: Activity, label: 'Flood Events (decade)', value: selectedDistrict.events },
                    { icon: Droplets, label: 'Waterlog Days (annual)', value: `${selectedDistrict.waterlogDays} days` },
                    { icon: Gauge, label: 'Model Risk', value: selectedDistrict.risk }
                  ].map((stat, index) => (
                    <div key={index} className="bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] rounded-xl p-4 text-center">
                      <stat.icon className="w-6 h-6 text-[#1565c0] mx-auto mb-2" />
                      <span className="text-xs text-[#64748b] block mb-1">{stat.label}</span>
                      <span className="text-lg font-bold text-[#0d1b2a]">{stat.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#f8fafc] rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-[#0d1b2a] mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#1565c0]" />
                      Rainfall Trend (2015-2024)
                    </h4>
                    <div className="h-32 flex items-end gap-1">
                      {[780, 950, 720, 1100, 1050, 800, 980, 760, 1020, 870].map((val, i) => (
                        <div 
                          key={i}
                          className="flex-1 bg-gradient-to-t from-[#1565c0] to-[#0288d1] rounded-t transition-all hover:opacity-80"
                          style={{ height: `${(val / 1100) * 100}%` }}
                          title={`${2015 + i}: ${val}mm`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-[#64748b]">
                      <span>2015</span>
                      <span>2024</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#f8fafc] rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-[#0d1b2a] mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#1565c0]" />
                      Risk Assessment
                    </h4>
                    <div className="flex items-center justify-around h-32">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#1565c0] mb-2">{selectedDistrict.events}</div>
                        <div className="text-xs text-[#64748b]">Flood Events<br/>(2015-2024)</div>
                      </div>
                      <div className="h-20 w-px bg-[#bbdefb]" />
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#1a237e] mb-2">{selectedDistrict.waterlogDays}</div>
                        <div className="text-xs text-[#64748b]">Waterlog Days<br/>(Annual Avg)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* City Planner Section */}
        {activeNav === 'City Planner' && (
          <section className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              <CityPlannerSection />
            </div>
          </section>
        )}

        {/* Simulation Panel (Custom Simulation tab) */}
        {activeNav === 'Custom Simulation' && (
        <section className="px-4 lg:px-6 mt-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Collapse Header */}
              <button
                onClick={() => setSimulationOpen(!simulationOpen)}
                className="w-full p-4 bg-gradient-to-r from-[#1a237e] to-[#0288d1] text-white flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">Run Custom Flood Simulation</span>
                </div>
                {simulationOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {/* Simulation Content */}
              {simulationOpen && (
                <div className="p-6">
                  <p className="text-[#64748b] mb-6">
                    Adjust parameters to simulate flood scenarios for any condition
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Rainfall Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CloudRain className="w-4 h-4 text-[#1565c0]" />
                          <span className="text-sm font-medium text-[#0d1b2a]">Annual Rainfall (mm)</span>
                        </div>
                        <span className="px-2 py-1 bg-[#e3f2fd] rounded text-sm font-semibold text-[#1565c0]">
                          {simParams.rainfall}
                        </span>
                      </div>
                      <Slider
                        value={[simParams.rainfall]}
                        onValueChange={([val]) => setSimParams({...simParams, rainfall: val})}
                        min={0}
                        max={3000}
                        step={10}
                        className="[&_[role=slider]]:bg-[#1565c0]"
                      />
                      <div className="flex justify-between mt-1 text-xs text-[#64748b]">
                        <span>0</span>
                        <span>3000</span>
                      </div>
                    </div>
                    
                    {/* Soil Moisture Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-[#1565c0]" />
                          <span className="text-sm font-medium text-[#0d1b2a]">Soil Moisture (%)</span>
                        </div>
                        <span className="px-2 py-1 bg-[#e3f2fd] rounded text-sm font-semibold text-[#1565c0]">
                          {simParams.soilMoisture}
                        </span>
                      </div>
                      <Slider
                        value={[simParams.soilMoisture]}
                        onValueChange={([val]) => setSimParams({...simParams, soilMoisture: val})}
                        min={0}
                        max={100}
                        step={1}
                        className="[&_[role=slider]]:bg-[#1565c0]"
                      />
                      <div className="flex justify-between mt-1 text-xs text-[#64748b]">
                        <span>0</span>
                        <span>100</span>
                      </div>
                    </div>
                    
                    {/* Elevation Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Mountain className="w-4 h-4 text-[#1565c0]" />
                          <span className="text-sm font-medium text-[#0d1b2a]">Elevation (m)</span>
                        </div>
                        <span className="px-2 py-1 bg-[#e3f2fd] rounded text-sm font-semibold text-[#1565c0]">
                          {simParams.elevation}
                        </span>
                      </div>
                      <Slider
                        value={[simParams.elevation]}
                        onValueChange={([val]) => setSimParams({...simParams, elevation: val})}
                        min={0}
                        max={1000}
                        step={5}
                        className="[&_[role=slider]]:bg-[#1565c0]"
                      />
                      <div className="flex justify-between mt-1 text-xs text-[#64748b]">
                        <span>0</span>
                        <span>1000</span>
                      </div>
                    </div>
                    
                    {/* Drainage Capacity Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-[#1565c0]" />
                          <span className="text-sm font-medium text-[#0d1b2a]">Drainage Capacity (%)</span>
                        </div>
                        <span className="px-2 py-1 bg-[#e3f2fd] rounded text-sm font-semibold text-[#1565c0]">
                          {simParams.drainageCapacity}
                        </span>
                      </div>
                      <Slider
                        value={[simParams.drainageCapacity]}
                        onValueChange={([val]) => setSimParams({...simParams, drainageCapacity: val})}
                        min={0}
                        max={100}
                        step={1}
                        className="[&_[role=slider]]:bg-[#1565c0]"
                      />
                      <div className="flex justify-between mt-1 text-xs text-[#64748b]">
                        <span>0</span>
                        <span>100</span>
                      </div>
                    </div>
                    
                    {/* Runoff Coefficient Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#1565c0]" />
                          <span className="text-sm font-medium text-[#0d1b2a]">Runoff Coefficient</span>
                        </div>
                        <span className="px-2 py-1 bg-[#e3f2fd] rounded text-sm font-semibold text-[#1565c0]">
                          {simParams.runoffCoefficient.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[simParams.runoffCoefficient * 100]}
                        onValueChange={([val]) => setSimParams({...simParams, runoffCoefficient: val / 100})}
                        min={0}
                        max={100}
                        step={1}
                        className="[&_[role=slider]]:bg-[#1565c0]"
                      />
                      <div className="flex justify-between mt-1 text-xs text-[#64748b]">
                        <span>0.0</span>
                        <span>1.0</span>
                      </div>
                    </div>
                    
                    {/* Distance to River Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#1565c0]" />
                          <span className="text-sm font-medium text-[#0d1b2a]">Distance to River (km)</span>
                        </div>
                        <span className="px-2 py-1 bg-[#e3f2fd] rounded text-sm font-semibold text-[#1565c0]">
                          {simParams.distanceToRiver}
                        </span>
                      </div>
                      <Slider
                        value={[simParams.distanceToRiver]}
                        onValueChange={([val]) => setSimParams({...simParams, distanceToRiver: val})}
                        min={0}
                        max={50}
                        step={0.5}
                        className="[&_[role=slider]]:bg-[#1565c0]"
                      />
                      <div className="flex justify-between mt-1 text-xs text-[#64748b]">
                        <span>0</span>
                        <span>50</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={runSimulation}
                    disabled={simulationLoading}
                    className="w-full h-14 bg-gradient-to-r from-[#1a237e] to-[#0288d1] hover:from-[#1565c0] hover:to-[#0288d1] text-white font-semibold text-lg shadow-lg"
                  >
                    {simulationLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                  
                  {/* Simulation Results */}
                  {simulationResults && (
                    <div className="mt-6 animate-fadeIn">
                      <SimulationResults results={simulationResults} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        )}
      </main>

      {/* Summary Statistics Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-12 bg-[#1a237e] flex items-center justify-center gap-4 lg:gap-8 px-4 text-white text-sm z-30 overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-white/60">Total Districts:</span>
          <span className="font-semibold">{totalDistricts}</span>
        </div>
        <div className="w-px h-6 bg-white/20" />
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-white/60">High Risk:</span>
          <span className="font-semibold text-[#90caf9]">{highRiskDistricts}</span>
        </div>
        <div className="w-px h-6 bg-white/20" />
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-white/60">Avg Rainfall:</span>
          <span className="font-semibold">{avgRainfall} mm</span>
        </div>
        <div className="w-px h-6 bg-white/20 hidden md:block" />
        <div className="hidden md:flex items-center gap-2 whitespace-nowrap">
          <span className="text-white/60">Flood Events (2024):</span>
          <span className="font-semibold">{floodEventsThisYear}</span>
        </div>
        <div className="w-px h-6 bg-white/20 hidden lg:block" />
        <div className="hidden lg:flex items-center gap-2 whitespace-nowrap">
          <span className="text-white/60">Last Updated:</span>
          <span className="font-semibold">{new Date().toLocaleDateString()}</span>
        </div>
      </footer>

      <style jsx>{`
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-100%); 
          }
          to { 
            opacity: 1;
            transform: translateY(0); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}