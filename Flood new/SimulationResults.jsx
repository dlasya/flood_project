import { useEffect, useState } from 'react';
import { Gauge, TrendingUp, Droplets, AlertTriangle } from 'lucide-react';

export default function SimulationResults({ results }) {
  const [animatedRisk, setAnimatedRisk] = useState(0);
  const [animatedProb, setAnimatedProb] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedRisk(results.flood_risk_percent);
      setAnimatedProb(Math.round(results.flood_probability * 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [results]);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'bg-[#e3f2fd] text-[#1565c0]';
      case 'moderate': return 'bg-[#bbdefb] text-[#1565c0]';
      case 'high': return 'bg-[#1565c0] text-white';
      case 'severe': return 'bg-[#1565c0] text-white';
      case 'extreme': return 'bg-[#1a237e] text-white';
      default: return 'bg-[#bbdefb] text-[#1565c0]';
    }
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedRisk / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Flood Risk */}
      <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#1565c0]">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-4 h-4 text-[#1565c0]" />
          <span className="text-sm font-medium text-[#0d1b2a]">Flood Risk</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e3f2fd" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={animatedRisk > 70 ? '#1a237e' : animatedRisk > 40 ? '#1565c0' : '#42a5f5'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#0d1b2a]">{animatedRisk}%</span>
            </div>
          </div>
          <span className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(results.flood_severity)}`}>
            {results.flood_severity}
          </span>
        </div>
      </div>

      {/* Flood Probability */}
      <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#1565c0]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#1565c0]" />
          <span className="text-sm font-medium text-[#0d1b2a]">Probability</span>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-[#0d1b2a] mb-3">{animatedProb}%</div>
          <div className="w-full h-3 bg-[#e3f2fd] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#42a5f5] to-[#1565c0]"
              style={{ width: `${animatedProb}%`, transition: 'width 1s ease-out' }}
            />
          </div>
          <p className="text-xs text-[#64748b] mt-2">AI Confidence</p>
        </div>
      </div>

      {/* Waterlogging Days */}
      <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#1565c0]">
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="w-4 h-4 text-[#1565c0]" />
          <span className="text-sm font-medium text-[#0d1b2a]">Waterlogging</span>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-[#0d1b2a]">{results.waterlogging_days}</div>
          <p className="text-sm text-[#1565c0] mb-2">Expected Days</p>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(results.waterlogging_severity)}`}>
            {results.waterlogging_severity}
          </span>
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#1565c0]">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-[#1565c0]" />
          <span className="text-sm font-medium text-[#0d1b2a]">Assessment</span>
        </div>
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
            results.flood_risk_percent > 70 ? 'bg-[#1a237e]' : 
            results.flood_risk_percent > 40 ? 'bg-[#1565c0]' : 'bg-[#42a5f5]'
          }`}>
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm font-semibold text-[#0d1b2a]">
            {results.flood_risk_percent > 70 ? 'High Alert' : 
             results.flood_risk_percent > 40 ? 'Moderate Risk' : 'Low Risk'}
          </p>
          <p className="text-xs text-[#64748b] mt-1">Based on simulation</p>
        </div>
      </div>
    </div>
  );
}