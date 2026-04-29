import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Droplets, MapPin, Search, X, AlertTriangle, Database, TrendingUp, Users, Shield, ChevronDown, Lock, Eye, EyeOff } from 'lucide-react';

const API_BASE = 'http://localhost:5001';

export default function Homepage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [pincode, setPincode] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const canvasRef = useRef(null);
  
  const [loginForm, setLoginForm] = useState({ userId: '', password: '' });
  const [forgotForm, setForgotForm] = useState({ userId: '', newPassword: '' });
  const [signupForm, setSignupForm] = useState({ fullName: '', userId: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if already logged in - only for planners
  useEffect(() => {
    const storedUser = sessionStorage.getItem('floodsense_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.type === 'planner') {
        navigate('/PlannerDashboard');
      }
    }
  }, [navigate]);

  // Rain animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const raindrops = [];
    const maxRaindrops = 100;
    
    class Raindrop {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.length = Math.random() * 20 + 10;
        this.speed = Math.random() * 5 + 5;
        this.opacity = Math.random() * 0.5 + 0.3;
      }
      
      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.y = -this.length;
          this.x = Math.random() * canvas.width;
        }
      }
      
      draw() {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
      }
    }
    
    for (let i = 0; i < maxRaindrops; i++) {
      raindrops.push(new Raindrop());
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      raindrops.forEach(drop => {
        drop.update();
        drop.draw();
      });
      requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePincodeSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/api/predictions/by-pincode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pincode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Prediction failed');
        setSearchLoading(false);
        return;
      }
      navigate('/prediction-results', { state: { predictionData: data } });
    } catch (err) {
      setError('Network error. Ensure backend is running on port 5001.');
      setSearchLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loginForm.userId, password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      const user = data.user;
      if (user.type !== 'planner') {
        setError('Access denied. Only city planners can login here.');
        setLoading(false);
        return;
      }
      sessionStorage.setItem('floodsense_user', JSON.stringify(user));
      navigate('/PlannerDashboard');
    } catch (err) {
      setError('Network error. Ensure backend is running on port 5001.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!forgotForm.userId || !forgotForm.newPassword) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: forgotForm.userId,
          newPassword: forgotForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not reset password');
        setLoading(false);
        return;
      }
      setShowForgotPassword(false);
      setForgotForm({ userId: '', newPassword: '' });
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: signupForm.fullName,
          userId: signupForm.userId,
          password: signupForm.password,
          type: 'planner',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }
      const user = data.user;
      sessionStorage.setItem('floodsense_user', JSON.stringify(user));
      navigate('/PlannerDashboard');
    } catch (err) {
      setError('Network error. Ensure backend is running on port 5001.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Title and Pincode */}
      <div className="relative min-h-screen bg-gradient-to-br from-[#1a237e] via-[#1565c0] to-[#0288d1] flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        
        <div className="relative z-10 text-center px-6 py-12 max-w-4xl mx-auto w-full">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <Droplets className="w-16 h-16 lg:w-24 lg:h-24 text-white" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white rounded-sm" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight mb-6">
            Flood and WaterLogging Prediction System
          </h1>
          
          <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto mb-12">
            Get accurate flood risk assessments and waterlogging predictions for any location in India
          </p>
          
          {/* Pincode Search Form */}
          <form onSubmit={handlePincodeSearch} className="max-w-md mx-auto">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 text-white/70" />
              <Input
                type="text"
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pl-12 pr-12 h-14 lg:h-16 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-white focus:bg-white/20 text-lg"
                maxLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setPincode('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <Button
              type="submit"
              disabled={searchLoading || pincode.length !== 6}
              className="w-full mt-4 h-12 lg:h-14 rounded-xl bg-white text-[#1565c0] hover:bg-white/90 font-semibold text-lg shadow-lg shadow-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              {searchLoading ? (
                <div className="w-6 h-6 border-2 border-[#1565c0] border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Search className="w-5 h-5 lg:w-6 lg:h-6" />
                  Check Flood Risk
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* About Section - Horizontal Layout Below Pincode */}
      <div className="bg-gradient-to-b from-[#0288d1] to-white">
        <div className="px-6 lg:px-12 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-white mb-12">About Our System</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: AlertTriangle,
                  title: "Early Warning System",
                  description: "Get advance warnings about potential flooding and waterlogging in your area based on weather patterns and historical data."
                },
                {
                  icon: Database,
                  title: "Comprehensive Data Analysis",
                  description: "Our system analyzes multiple data sources including rainfall patterns, drainage systems, soil conditions, and historical flood records."
                },
                {
                  icon: TrendingUp,
                  title: "Predictive Analytics",
                  description: "Machine learning algorithms provide accurate predictions of flood risk and waterlogging duration for specific locations."
                },
                {
                  icon: MapPin,
                  title: "Location-Specific Insights",
                  description: "Get detailed risk assessments tailored to your specific pincode, considering local infrastructure and geography."
                },
                {
                  icon: Users,
                  title: "For Everyone",
                  description: "Public users can check flood risk by pincode without registration. City planners get advanced tools for urban planning."
                },
                {
                  icon: Shield,
                  title: "Reliable & Secure",
                  description: "Built with robust security measures and reliable data sources to provide trustworthy flood risk information."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-white hover:bg-white/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-xs text-white/80 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-6">How It Works</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[
                  "Enter Pincode",
                  "AI Analysis", 
                  "Risk Assessment",
                  "Get Results"
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-white text-[#1565c0] flex items-center justify-center font-semibold mb-2">
                      {i + 1}
                    </div>
                    <p className="text-xs text-white/80">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* City Planner Portal Section */}
      <div className="py-20 px-6 lg:px-12 bg-gradient-to-b from-white to-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#0d1b2a] mb-4">City Planner Portal</h2>
            <p className="text-xl text-[#64748b] max-w-2xl mx-auto">
              Access advanced urban planning tools, comprehensive flood analytics, and infrastructure insights for better city management.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-[#e3f2fd] max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a237e] to-[#0288d1] flex items-center justify-center shadow-lg mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#0d1b2a] mb-2">City Planner Access</h3>
              <p className="text-[#1565c0]">Sign in to access advanced planning features</p>
            </div>
            
            <Button
              onClick={() => setShowLoginModal(true)}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#1a237e] to-[#0288d1] hover:from-[#1565c0] hover:to-[#0288d1] text-white font-semibold text-lg shadow-lg shadow-[#1565c0]/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <Shield className="w-5 h-5 mr-2" />
              City Planner Login
            </Button>
            
            <div className="mt-6 p-4 bg-[#e3f2fd] rounded-xl">
              <p className="text-xs text-[#1565c0] font-medium mb-2">Demo planner credentials:</p>
              <div className="text-xs text-[#0d1b2a] font-mono">
                admin.floodsense / FloodSense@Master
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0d1b2a]">City Planner Access</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-[#64748b] hover:text-[#0d1b2a]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {!showForgotPassword ? (
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                    <Input
                      type="text"
                      placeholder="Planner User ID"
                      value={loginForm.userId}
                      onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                      className="pl-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="pl-12 pr-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1565c0]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1a237e] to-[#0288d1] hover:from-[#1565c0] hover:to-[#0288d1] text-white font-semibold shadow-lg shadow-[#1565c0]/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[#1565c0] hover:text-[#0d1b2a] text-sm"
                  >
                    Forgot Password?
                  </button>
                  <div className="text-[#64748b] text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[#1565c0] hover:text-[#0d1b2a] font-medium"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input
                    type="text"
                    placeholder="User ID"
                    value={forgotForm.userId}
                    onChange={(e) => setForgotForm({ ...forgotForm, userId: e.target.value })}
                    className="pl-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                    required
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={forgotForm.newPassword}
                    onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                    className="pl-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#1a237e] to-[#0288d1] hover:from-[#1565c0] hover:to-[#0288d1] text-white font-semibold shadow-lg shadow-[#1565c0]/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotForm({ userId: '', newPassword: '' });
                    }}
                    className="px-6 h-12 rounded-xl border border-[#bbdefb] text-[#1565c0] hover:bg-[#f8fafc] font-semibold transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
