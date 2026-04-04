import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplets, MapPin, Zap, AlertTriangle, CloudRain, 
  Mountain, Layers, Gauge, Calendar, TrendingUp, Shield,
  Home, Bell, History, LogOut, Menu, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FloodRiskGauge from "@/components/FloodRiskGauge";
import ProbabilityBar from "@/components/ProbabilityBar";
import WaterloggingCard from "@/components/WaterloggingCard";
import LocationProfileCard from "@/components/LocationProfileCard";
import AnalysisTabs from "@/components/AnalysisTabs";

// Known pincodes mapped to locality + district/state metadata
const PINCODE_METADATA = {
  '500080': { label: 'Tank Bund', district: 'Hyderabad', state: 'Telangana' },
  '500001': { label: 'Abids', district: 'Hyderabad', state: 'Telangana' },
  '530001': { label: 'Old Town', district: 'Visakhapatnam', state: 'Andhra Pradesh' },
};

// Dummy prediction data used as a baseline profile before calling the real model
const DUMMY_PREDICTIONS = {
  '500001': {
    district: "Hyderabad",
    state: "Telangana",
    flood_risk_percent: 72,
    flood_probability: 0.78,
    waterlogging_days: 18,
    waterlogging_severity: "Severe",
    flood_severity: "High",
    annual_rainfall: 850,
    elevation: 536,
    soil_type: "Black Cotton",
    drainage_quality: "Good",
    monthly_waterlogging: [0,0,0,0,2,8,15,12,9,6,2,0],
    feature_importance: {
      "Annual Rainfall": 0.85,
      "Drainage Capacity": 0.72,
      "Soil Moisture": 0.68,
      "Elevation": 0.61,
      "Runoff Coefficient": 0.55,
      "Distance to River": 0.48,
      "Urban Percent": 0.45,
      "Slope": 0.38,
      "Soil Type": 0.32,
      "Waterbody Proximity": 0.28
    },
    historical: {
      years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
      flood_occurred: [0,1,0,1,1,0,1,0,1,1],
      rainfall: [780,950,720,1100,1050,800,980,760,1020,870]
    }
  },
  '530001': {
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    flood_risk_percent: 58,
    flood_probability: 0.62,
    waterlogging_days: 12,
    waterlogging_severity: "Moderate",
    flood_severity: "Moderate",
    annual_rainfall: 1100,
    elevation: 45,
    soil_type: "Alluvial",
    drainage_quality: "Moderate",
    monthly_waterlogging: [0,0,0,1,3,7,10,9,7,4,1,0],
    feature_importance: {
      "Annual Rainfall": 0.80,
      "Drainage Capacity": 0.65,
      "Soil Moisture": 0.60,
      "Elevation": 0.72,
      "Runoff Coefficient": 0.50,
      "Distance to River": 0.55,
      "Urban Percent": 0.48,
      "Slope": 0.35,
      "Soil Type": 0.30,
      "Waterbody Proximity": 0.42
    },
    historical: {
      years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
      flood_occurred: [1,0,1,0,1,1,0,1,0,1],
      rainfall: [1050,920,1180,980,1250,1100,950,1080,1020,1150]
    }
  }
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showHighRiskAlert, setShowHighRiskAlert] = useState(false);
  const [showWaterlogAlert, setShowWaterlogAlert] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('floodsense_user');
    if (!storedUser) {
      navigate('/Login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('floodsense_user');
    navigate('/Login');
  };

  const handleAnalyze = async () => {
    if (!pincode || pincode.length !== 6) return;
    
    setLoading(true);
    setShowResults(false);

    try {
      const res = await fetch("http://localhost:5001/api/predictions/by-pincode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode })
      });

      const api = await res.json();
      if (!res.ok) {
        throw new Error(api?.error || "Prediction failed");
      }

      const meta = PINCODE_METADATA[pincode];

      const merged = {
        pincode,
        place_label: meta?.label,
        district: api.district,
        state: api.state,
        annual_rainfall: undefined,
        elevation: undefined,
        soil_type: undefined,
        drainage_quality: undefined,
        monthly_waterlogging: [0,0,0,1,3,6,8,7,5,3,1,0],
        feature_importance: {
          "Annual Rainfall": 0.75,
          "Drainage Capacity": 0.68,
          "Soil Moisture": 0.62,
          "Elevation": 0.58,
          "Runoff Coefficient": 0.52
        },
        historical: {
          years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
          flood_occurred: [0,1,0,0,1,0,1,0,0,1],
          rainfall: [800,920,780,850,1000,880,950,820,900,870]
        },
        flood_risk_percent: api.flood_risk_percent,
        flood_probability: api.flood_probability,
        waterlogging_days: Math.round(api.waterlogging_days),
        waterlogging_severity: api.waterlogging_severity,
        flood_severity: api.flood_severity,
      };

      setPrediction(merged);
      setHistory((prev) => [
        {
          id: Date.now(),
          pincode,
          state: merged.state,
          district: merged.district,
          risk: merged.flood_risk_percent,
          probability: merged.flood_probability,
        },
        ...prev,
      ]);
      setShowResults(true);

      if (merged.flood_risk_percent > 70) setShowHighRiskAlert(true);
      if (merged.waterlogging_days > 15) setShowWaterlogAlert(true);
    } catch (err) {
      console.error("Analyze API error:", err);
      alert("Failed to fetch prediction from backend. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Alert Banners */}
      {showHighRiskAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#1a237e] text-white py-3 px-4 flex items-center justify-between animate-pulse-border">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span className="font-medium">HIGH FLOOD RISK DETECTED IN YOUR AREA</span>
          </div>
          <button onClick={() => setShowHighRiskAlert(false)} className="hover:bg-white/20 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {showWaterlogAlert && !showHighRiskAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#1565c0] text-white py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5" />
            <span className="font-medium">SIGNIFICANT WATERLOGGING EXPECTED</span>
          </div>
          <button onClick={() => setShowWaterlogAlert(false)} className="hover:bg-white/20 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className={`fixed ${showHighRiskAlert || showWaterlogAlert ? 'top-12' : 'top-0'} left-0 right-0 z-40 bg-[#1a237e] h-16 flex items-center justify-between px-4 lg:px-8 border-b-2 border-[#0288d1] shadow-lg transition-all`}>
        <div className="flex items-center gap-3">
          <Droplets className="w-8 h-8 text-white" />
          <span className="text-xl font-bold text-white hidden sm:block">FloodSense</span>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {['Dashboard', 'My Area', 'History', 'Alerts'].map((item) => (
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
          
          {/* Mobile Menu Toggle */}
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
        <div className={`fixed ${showHighRiskAlert || showWaterlogAlert ? 'top-28' : 'top-16'} left-0 right-0 z-30 bg-[#1a237e] border-b border-[#0288d1] lg:hidden`}>
          {['Dashboard', 'My Area', 'History', 'Alerts'].map((item) => (
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
      <main className={`${showHighRiskAlert || showWaterlogAlert ? 'pt-28' : 'pt-16'}`}>
        {activeNav === 'Dashboard' && (
          <>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-[#1565c0] to-[#0288d1] py-16 px-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="white"/>
                </svg>
              </div>
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                  Check Flood Risk For Your Area
                </h1>
                <p className="text-white/80 text-lg">
                  AI-powered predictions for urban flood and waterlogging analysis
                </p>
              </div>
              
              {/* Wave SVG */}
              <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
                <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,35 1440,30 L1440,60 L0,60 Z" fill="#f8fafc"/>
              </svg>
            </section>
            
            {/* Search Section */}
            <section className="px-4 -mt-8 relative z-20 max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#bbdefb] p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                    <Input
                      type="text"
                      placeholder="Enter 6-digit Pincode"
                      value={pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPincode(value);
                      }}
                      className="pl-12 h-14 rounded-xl border-[#bbdefb] focus:border-[#0288d1] text-lg"
                    />
                  </div>
                  
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading || !pincode || pincode.length !== 6}
                    className="h-14 rounded-xl bg-gradient-to-r from-[#1a237e] to-[#0288d1] hover:from-[#1565c0] hover:to-[#0288d1] text-white font-semibold text-lg shadow-lg shadow-[#1565c0]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Analyze Now
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Loading Wave Animation */}
                {loading && (
                  <div className="mt-6 h-2 bg-[#e3f2fd] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1a237e] via-[#0288d1] to-[#1a237e] rounded-full animate-wave" 
                         style={{ width: '50%', animation: 'wave 1.5s ease-in-out infinite' }} />
                  </div>
                )}
              </div>
            </section>
            
            {/* Results Section */}
            {showResults && prediction && (
              <section className="px-4 py-12 max-w-7xl mx-auto animate-fadeIn">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#0d1b2a] mb-8 text-center">
                  Prediction Results for{" "}
                  <span className="text-[#1565c0]">
                    {prediction.pincode}
                    {prediction.place_label ? ` - ${prediction.place_label}` : ''}
                  </span>
                  {", "}
                  {prediction.district}, {prediction.state}
                </h2>
                
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <FloodRiskGauge 
                    riskPercent={prediction.flood_risk_percent} 
                    severity={prediction.flood_severity}
                  />
                  <ProbabilityBar 
                    probability={prediction.flood_probability}
                  />
                  <WaterloggingCard 
                    days={prediction.waterlogging_days}
                    severity={prediction.waterlogging_severity}
                    monthlyData={prediction.monthly_waterlogging}
                  />
                  <LocationProfileCard 
                    district={prediction.district}
                    state={prediction.state}
                    rainfall={prediction.annual_rainfall}
                    elevation={prediction.elevation}
                    soilType={prediction.soil_type}
                    drainage={prediction.drainage_quality}
                  />
                </div>
                
                {/* Detailed Analysis Tabs */}
                <AnalysisTabs 
                  featureImportance={prediction.feature_importance}
                  historical={prediction.historical}
                  riskLevel={prediction.flood_severity}
                />
              </section>
            )}
          </>
        )}

        {activeNav === 'My Area' && (
          <section className="px-4 py-12 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-[#0d1b2a] mb-4">My Area Overview</h2>
            <p className="text-[#64748b] mb-6">
              Latest flood risk snapshot for your recent pincode searches.
            </p>
            {history.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#bbdefb] p-6 text-center text-[#64748b]">
                Run an analysis on the Dashboard tab to see your area summary here.
              </div>
            )}
            {history.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {history.slice(0, 4).map((h) => (
                  <div key={h.id} className="bg-white rounded-2xl shadow-sm border border-[#e3f2fd] p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-[#64748b]">Pincode</p>
                        <p className="text-lg font-semibold text-[#0d1b2a]">
                          {h.pincode}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e3f2fd] text-[#1565c0]">
                        {h.district}, {h.state}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#64748b]">Flood Risk</p>
                        <p className="text-xl font-bold text-[#1a237e]">{h.risk}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748b]">Flood Probability</p>
                        <p className="text-lg font-semibold text-[#1565c0]">
                          {(h.probability * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeNav === 'History' && (
          <section className="px-4 py-12 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-[#0d1b2a] mb-4">Analysis History</h2>
            <p className="text-[#64748b] mb-6">
              Track the locations you have analysed over this session.
            </p>
            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#bbdefb] p-6 text-center text-[#64748b]">
                No history yet. Run an analysis from the Dashboard tab.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#e3f2fd] bg-white shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#e3f2fd] text-[#0d1b2a]">
                    <tr>
                      <th className="px-4 py-3 text-left">Pincode</th>
                      <th className="px-4 py-3 text-left">District</th>
                      <th className="px-4 py-3 text-left">State</th>
                      <th className="px-4 py-3 text-right">Flood Risk</th>
                      <th className="px-4 py-3 text-right">Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-t border-[#f1f5f9]">
                        <td className="px-4 py-3 font-mono">{h.pincode}</td>
                        <td className="px-4 py-3">{h.district}</td>
                        <td className="px-4 py-3">{h.state}</td>
                        <td className="px-4 py-3 text-right">{h.risk}%</td>
                        <td className="px-4 py-3 text-right">{(h.probability * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeNav === 'Alerts' && (
          <section className="px-4 py-12 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-[#0d1b2a] mb-4">Alerts</h2>
            <p className="text-[#64748b] mb-6">
              High-priority notifications based on recent flood risk checks.
            </p>
            {!prediction && (
              <div className="rounded-2xl border border-dashed border-[#bbdefb] p-6 text-center text-[#64748b]">
                No active alerts. Run an analysis to generate location-specific alerts.
              </div>
            )}
            {prediction && (
              <div className="space-y-4">
                {prediction.flood_risk_percent > 70 && (
                  <div className="flex items-start gap-3 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-700">
                        High flood risk for {prediction.district}, {prediction.state}
                      </p>
                      <p className="text-sm text-red-700/80 mt-1">
                        Model indicates {prediction.flood_risk_percent}% flood risk with{" "}
                        {(prediction.flood_probability * 100).toFixed(0)}% probability. 
                        Review evacuation and drainage plans for this locality.
                      </p>
                    </div>
                  </div>
                )}
                {prediction.waterlogging_days > 10 && (
                  <div className="flex items-start gap-3 rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4">
                    <Droplets className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800">
                        Prolonged waterlogging expected
                      </p>
                      <p className="text-sm text-amber-800/80 mt-1">
                        Estimated {Math.round(prediction.waterlogging_days)} waterlogging days. 
                        Plan for pumping, traffic diversions, and public advisories.
                      </p>
                    </div>
                  </div>
                )}
                {prediction.flood_risk_percent <= 70 && prediction.waterlogging_days <= 10 && (
                  <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-sm text-[#166534]">
                    No severe alerts for the last analysed location. Continue monitoring during heavy rainfall events.
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0d1b2a] text-white py-12 px-4 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Droplets className="w-8 h-8 text-[#0288d1]" />
                <span className="text-xl font-bold">FloodSense</span>
              </div>
              <p className="text-white/60">AI-powered flood intelligence for smarter urban planning</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {['Home', 'Dashboard', 'Alerts', 'About'].map((link) => (
                  <button key={link} className="block text-white/60 hover:text-[#0288d1] transition-colors">
                    {link}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Data Sources</h4>
              <p className="text-white/60">Data sourced from IMD, NDMA</p>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 text-center text-white/40 text-sm">
            Built for Andhra Pradesh and Telangana Urban Flood Management
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-border {
          animation: pulseBorder 2s infinite;
        }
        @keyframes pulseBorder {
          0%, 100% { box-shadow: 0 0 0 0 rgba(2, 136, 209, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(2, 136, 209, 0.4); }
        }
      `}</style>
    </div>
  );
}