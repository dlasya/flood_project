import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Droplets, UserPlus, Zap, Shield, MapPin, BarChart3, Search, ChevronDown, AlertTriangle, Users, Database, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = 'http://localhost:5001';

export default function Homepage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const drops = [];
    for (let i = 0; i < 150; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      
      drops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 1, drop.y + drop.length);
        ctx.globalAlpha = drop.opacity;
        ctx.stroke();
        
        drop.y += drop.speed;
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handlePincodeSearch = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    
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
        setError(data.error || 'Failed to get prediction for this pincode');
        setSearchLoading(false);
        return;
      }
      
      // Store prediction data and navigate to results page
      sessionStorage.setItem('pincode_prediction', JSON.stringify(data));
      navigate('/prediction-results', { state: { predictionData: data } });
      
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
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

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Full Screen Hero Section */}
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
          
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight mb-6">
            Flood and WaterLogging<br />Prediction System
          </h1>
          <p className="text-white/80 text-lg lg:text-xl xl:text-2xl font-light mb-12">
            AI-Powered Urban Flood Intelligence
          </p>
          
          {/* Centered Pincode Search */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/20">
              <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-4">
                Check Flood Risk by Pincode
              </h2>
              <p className="text-white/80 text-center mb-8">
                Enter your pincode to get instant flood and waterlogging predictions
              </p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50/90 backdrop-blur border border-red-200 rounded-xl text-red-600 text-sm text-center">
                  {error}
                </div>
              )}
              
              {/* Pincode Search Form */}
              <form onSubmit={handlePincodeSearch} className="space-y-5">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                  <Input
                    type="text"
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-12 h-14 lg:h-16 rounded-xl border-white/30 bg-white/90 focus:border-white focus:ring-white/30 text-[#0d1b2a] placeholder:text-[#64748b] backdrop-blur"
                    maxLength={6}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={searchLoading || pincode.length !== 6}
                  className="w-full h-14 lg:h-16 rounded-xl bg-white text-[#1565c0] hover:bg-white/90 font-semibold text-lg lg:text-xl shadow-lg shadow-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  {searchLoading ? (
                    <div className="w-6 h-6 border-2 border-[#1565c0] border-t-transparent rounded-full animate-spin" />
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
          
                  </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce cursor-pointer" onClick={scrollToAbout}>
          <ChevronDown className="w-8 h-8" />
        </div>
      </div>

      {/* About Section */}
      <div id="about-section" className="py-20 px-6 lg:px-12 bg-gradient-to-b from-white to-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#0d1b2a] mb-16">About Our System</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-[#e3f2fd] hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a237e] to-[#0288d1] flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#0d1b2a] mb-3">{feature.title}</h3>
                <p className="text-[#64748b] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold text-[#0d1b2a] mb-4">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                "Enter Pincode",
                "AI Analysis",
                "Risk Assessment",
                "Get Results"
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#1565c0] text-white flex items-center justify-center font-semibold mb-3">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[#64748b]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* City Planner Section */}
      <div className="py-20 px-6 lg:px-12 bg-gradient-to-b from-[#f8fafc] to-white">
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
          </div>
        </div>
      </div>

      {/* Login Modal for City Planners */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0d1b2a]">City Planner Access</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-[#64748b] hover:text-[#0d1b2a]"
              >
                ×
              </button>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            
            {!isSignUp ? (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input
                    type="text"
                    name="planner-username-field"
                    placeholder="Planner User ID"
                    value={loginForm.userId}
                    onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                    className="pl-12 h-14 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20 text-[#0d1b2a] placeholder:text-[#90caf9]"
                    required
                    autoComplete="new-username"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    onBlur={(e) => e.target.setAttribute('readonly', true)}
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="planner-password-field"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="pl-12 pr-12 h-14 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20 text-[#0d1b2a] placeholder:text-[#90caf9]"
                    required
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    onBlur={(e) => e.target.setAttribute('readonly', true)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1565c0] hover:text-[#0288d1] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#1a237e] to-[#0288d1] hover:from-[#1565c0] hover:to-[#0288d1] text-white font-semibold text-lg shadow-lg shadow-[#1565c0]/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Sign In as Planner'
                  )}
                </Button>
              </form>
            ) : (
              /* Signup Form for Planners Only */
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                    className="pl-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                    required
                  />
                </div>
                
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input
                    type="text"
                    placeholder="Planner User ID"
                    value={signupForm.userId}
                    onChange={(e) => setSignupForm({ ...signupForm, userId: e.target.value })}
                    className="pl-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
                
                                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className="pl-12 pr-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1565c0]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    className="pl-12 pr-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1565c0]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1a237e] to-[#0288d1] hover:from-[#1565c0] hover:to-[#0288d1] text-white font-semibold shadow-lg shadow-[#1565c0]/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Create Planner Account'
                  )}
                </Button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-[#1565c0] hover:text-[#0288d1] font-medium transition-colors"
              >
                {isSignUp ? 'Already have a planner account? Sign In' : "Need a planner account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
