import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function DebugCityPlanner() {
  console.log('DebugCityPlanner component LOADED!');
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('DebugCityPlanner useEffect triggered!');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e3f2fd] p-8">
      {/* Header */}
      <header className="bg-[#1a237e] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Debug City Planner</h1>
                <p className="text-[#bbdefb] text-sm">Component Test</p>
              </div>
            </div>
            <Button onClick={() => navigate('/')} variant="ghost" className="text-white hover:bg-white/10">
              <LogOut className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#0d1b2a] mb-4">Debug Test</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-semibold">Component Status: LOADED ✅</p>
              <p className="text-blue-600 text-sm">Check console for debug messages</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-semibold">Test Counter: {count}</p>
              <Button onClick={() => setCount(count + 1)} className="mt-2">
                Increment Counter
              </Button>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 font-semibold">Next Steps:</p>
              <ul className="text-yellow-600 text-sm list-disc list-inside mt-2">
                <li>If you see this, component is loading</li>
                <li>Check browser console for debug messages</li>
                <li>Test increment counter to verify state updates</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
