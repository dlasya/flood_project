import { Droplets } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function WaterloggingCard({ days, severity, monthlyData }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = months.map((month, index) => ({
    month,
    days: monthlyData[index] || 0
  }));

  const getBadgeStyle = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'low': return 'bg-[#e3f2fd] text-[#1565c0]';
      case 'moderate': return 'bg-[#bbdefb] text-[#1565c0]';
      case 'severe': return 'bg-[#1565c0] text-white';
      case 'extreme': return 'bg-[#1a237e] text-white';
      default: return 'bg-[#bbdefb] text-[#1565c0]';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#1565c0] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-2 mb-6">
        <Droplets className="w-5 h-5 text-[#1565c0]" />
        <h3 className="font-semibold text-[#0d1b2a]">Waterlogging Analysis</h3>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-[#0d1b2a] mb-2">{days}</div>
        <p className="text-sm text-[#1565c0]">Expected Waterlogging Days</p>
        <span className={`inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-semibold ${getBadgeStyle(severity)}`}>
          {severity}
        </span>
      </div>
      
      <div className="h-32 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <YAxis 
              hide 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #bbdefb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`${value} days`, 'Waterlogging']}
            />
            <Bar 
              dataKey="days" 
              fill="#1565c0"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}