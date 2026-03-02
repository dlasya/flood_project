import { MapPin, CloudRain, Mountain, Layers, Gauge } from 'lucide-react';

export default function LocationProfileCard({ district, state, rainfall, elevation, soilType, drainage }) {
  const stats = [
    { icon: CloudRain, label: 'Annual Rainfall', value: `${rainfall} mm` },
    { icon: Mountain, label: 'Elevation', value: `${elevation} m` },
    { icon: Layers, label: 'Soil Type', value: soilType },
    { icon: Gauge, label: 'Drainage', value: drainage }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#1565c0] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-[#1565c0]" />
        <h3 className="font-semibold text-[#0d1b2a]">Location Profile</h3>
      </div>
      
      <div className="text-center mb-6">
        <h4 className="text-2xl font-bold text-[#0d1b2a]">{district}</h4>
        <p className="text-[#0288d1]">{state}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-[#e3f2fd] rounded-xl p-3 flex flex-col items-center text-center"
          >
            <stat.icon className="w-5 h-5 text-[#1565c0] mb-1" />
            <span className="text-xs text-[#64748b] mb-0.5">{stat.label}</span>
            <span className="text-sm font-semibold text-[#0d1b2a]">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}