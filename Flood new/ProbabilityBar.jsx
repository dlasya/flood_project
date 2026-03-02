import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function ProbabilityBar({ probability }) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const percent = Math.round(probability * 100);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(percent);
    }, 100);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#1565c0] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[#1565c0]" />
        <h3 className="font-semibold text-[#0d1b2a]">Flood Probability</h3>
      </div>
      
      <div className="flex flex-col items-center">
        <p className="text-sm text-[#1565c0] mb-4">AI Confidence Score</p>
        
        <div className="text-5xl font-bold text-[#0d1b2a] mb-6">
          {animatedWidth}%
        </div>
        
        <div className="w-full h-4 bg-[#e3f2fd] rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#90caf9] via-[#1565c0] to-[#1a237e]"
            style={{ 
              width: `${animatedWidth}%`,
              transition: 'width 1s ease-out'
            }}
          />
        </div>
        
        <p className="text-sm text-[#64748b] mt-4 text-center">
          Based on current environmental conditions
        </p>
      </div>
    </div>
  );
}