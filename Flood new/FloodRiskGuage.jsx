import { useEffect, useState } from 'react';
import { Gauge } from 'lucide-react';

export default function FloodRiskGauge({ riskPercent, severity }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(riskPercent);
    }, 100);
    return () => clearTimeout(timer);
  }, [riskPercent]);

  const getColor = (percent) => {
    if (percent < 30) return '#90caf9';
    if (percent < 50) return '#42a5f5';
    if (percent < 70) return '#1565c0';
    return '#1a237e';
  };

  const getBadgeStyle = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'low': return 'bg-[#e3f2fd] text-[#1565c0]';
      case 'moderate': return 'bg-[#bbdefb] text-[#1565c0]';
      case 'high': return 'bg-[#1565c0] text-white';
      case 'extreme': return 'bg-[#1a237e] text-white';
      default: return 'bg-[#bbdefb] text-[#1565c0]';
    }
  };

  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#1565c0] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-2 mb-6">
        <Gauge className="w-5 h-5 text-[#1565c0]" />
        <h3 className="font-semibold text-[#0d1b2a]">Flood Risk Assessment</h3>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="#e3f2fd"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke={getColor(animatedPercent)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-[#0d1b2a]">{animatedPercent}%</span>
            <span className="text-sm text-[#1565c0]">Risk</span>
          </div>
        </div>
        
        <span className={`mt-4 px-4 py-2 rounded-full text-sm font-semibold ${getBadgeStyle(severity)}`}>
          {severity}
        </span>
      </div>
    </div>
  );
}