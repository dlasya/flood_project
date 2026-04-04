import { useState } from 'react';
import { BarChart3, TrendingUp, Shield, AlertTriangle, Droplets, Home } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function AnalysisTabs({ featureImportance, historical, riskLevel }) {
  const [activeTab, setActiveTab] = useState('environmental');
  
  const tabs = [
    { id: 'environmental', label: 'Environmental Factors', icon: BarChart3 },
    { id: 'historical', label: 'Historical Trends', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommendations', icon: Shield }
  ];
  
  // Feature importance data for chart
  const featureData = Object.entries(featureImportance || {})
    .map(([name, value]) => ({ name, value: Math.round(value * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  
  // Historical data for chart
  const historicalData = (historical?.years || []).map((year, index) => ({
    year: year.toString(),
    floods: historical.flood_occurred[index],
    rainfall: historical.rainfall[index]
  }));
  
  // Recommendations based on risk level
  const getRecommendations = () => {
    const baseRecs = [
      {
        icon: AlertTriangle,
        title: 'Emergency Preparedness',
        description: 'Keep an emergency kit ready with essentials like water, food, and first aid supplies.'
      },
      {
        icon: Droplets,
        title: 'Monitor Weather Updates',
        description: 'Stay informed about weather forecasts and flood warnings in your area.'
      },
      {
        icon: Home,
        title: 'Secure Your Property',
        description: 'Install flood barriers and ensure proper drainage around your home.'
      }
    ];
    
    if (riskLevel === 'High' || riskLevel === 'Extreme') {
      return [
        {
          icon: AlertTriangle,
          title: 'Avoid Low-Lying Areas',
          description: 'Stay away from flood-prone zones during heavy rainfall periods.'
        },
        ...baseRecs.slice(0, 2)
      ];
    }
    
    return baseRecs;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="flex flex-wrap border-b border-[#e3f2fd]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#1a237e] to-[#0288d1] text-white'
                : 'text-[#1565c0] hover:bg-[#e3f2fd]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {/* Environmental Factors */}
        {activeTab === 'environmental' && (
          <div>
            <h4 className="text-lg font-semibold text-[#0d1b2a] mb-4">Key Flood Risk Factors</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3f2fd" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: '#0d1b2a', fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #bbdefb',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}%`, 'Importance']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#1565c0"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Historical Trends */}
        {activeTab === 'historical' && (
          <div>
            <h4 className="text-lg font-semibold text-[#0d1b2a] mb-4">10-Year Flood & Rainfall Trend</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3f2fd" />
                  <XAxis dataKey="year" tick={{ fill: '#64748b' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #bbdefb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="floods"
                    name="Flood Events"
                    stroke="#1a237e"
                    strokeWidth={2}
                    dot={{ fill: '#1a237e', r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rainfall"
                    name="Rainfall (mm)"
                    stroke="#0288d1"
                    strokeWidth={2}
                    dot={{ fill: '#0288d1', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Recommendations */}
        {activeTab === 'recommendations' && (
          <div>
            <h4 className="text-lg font-semibold text-[#0d1b2a] mb-6">Safety Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getRecommendations().map((rec, index) => (
                <div 
                  key={index}
                  className="bg-[#e3f2fd] rounded-xl p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1565c0] to-[#0288d1] flex items-center justify-center mx-auto mb-4">
                    <rec.icon className="w-7 h-7 text-white" />
                  </div>
                  <h5 className="font-semibold text-[#0d1b2a] mb-2">{rec.title}</h5>
                  <p className="text-sm text-[#64748b]">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}