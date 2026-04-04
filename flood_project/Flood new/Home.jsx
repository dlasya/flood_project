import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Droplets, ChevronDown, MapPin, Brain, Shield, Zap, BarChart3, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE } from './config';

export default function Home() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const loginRef = useRef(null);
  const learnMoreRef = useRef(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ userId: '', password: '' });
  const [forgotForm, setForgotForm] = useState({ userId: '', newPassword: '' });
  const [signupForm, setSignupForm] = useState({ fullName: '', userId: '', password: '', confirmPassword: '', district: 'Hyderabad', state: 'Telangana', type: 'user', access: '' });

  // Auth check
  useEffect(() => {
    const storedUser = sessionStorage.getItem('floodsense_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      navigate(user.type === 'planner' ? '/PlannerDashboard' : '/UserDashboard');
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  // Rain animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || checkingAuth) return;
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
  }, [checkingAuth]);

  if (checkingAuth) return null;

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
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      const user = data.user;
      sessionStorage.setItem('floodsense_user', JSON.stringify(user));
      navigate(user.type === 'planner' ? '/PlannerDashboard' : '/UserDashboard');
    } catch (err) {
      setError(`Network error contacting ${API_BASE}. Is the backend running?`);
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
        body: JSON.stringify({ userId: forgotForm.userId, newPassword: forgotForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not reset password'); setLoading(false); return; }
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
    if (signupForm.password !== signupForm.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: signupForm.fullName,
          userId: signupForm.userId,
          password: signupForm.password,
          type: signupForm.type,
          ...(signupForm.type === 'planner'
            ? { access: signupForm.access }
            : { district: signupForm.district, state: signupForm.state }),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Signup failed'); setLoading(false); return; }
      const user = data.user;
      sessionStorage.setItem('floodsense_user', JSON.stringify(user));
      navigate(user.type === 'planner' ? '/PlannerDashboard' : '/UserDashboard');
    } catch (err) {
      setError(`Network error contacting ${API_BASE}. Is the backend running?`);
      setLoading(false);
    }
  };

  return (
    <div className="font-sans">

      {/* ===== HERO SECTION ===== */}
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a237e] via-[#1565c0] to-[#0288d1] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="relative z-10 text-center px-6">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <Droplets className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-6xl lg:text-8xl font-extrabold text-white tracking-tight mb-4">
            FloodSense
          </h1>
          <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-xl mx-auto">
            AI-powered flood risk prediction for smarter, safer cities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => loginRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 bg-white text-[#1565c0] font-bold text-lg rounded-2xl shadow-lg hover:bg-blue-50 transition"
            >
              Get Started
            </button>
            <button
              onClick={() => learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 bg-white/20 backdrop-blur text-white font-bold text-lg rounded-2xl border border-white/40 hover:bg-white/30 transition"
            >
              Learn More
            </button>
          </div>
        </div>

        <button
          onClick={() => learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-10 z-10 animate-bounce"
        >
          <ChevronDown className="w-8 h-8 text-white/70" />
        </button>
      </div>

      {/* ===== LEARN MORE SECTION ===== */}
      <div ref={learnMoreRef} className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-1 rounded-full border border-blue-200 text-blue-600 text-sm mb-6">
            • Core Capabilities
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            What Our System Does
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-16">
            Get accurate flood and waterlogging risk predictions using advanced AI and comprehensive location data analysis
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-left">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Pincode-Based Analysis</h3>
              <p className="text-gray-500">Enter any pincode to get location-specific flood and waterlogging risk assessment</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">AI Risk Prediction</h3>
              <p className="text-gray-500">Machine learning models analyze rainfall, elevation, soil, and drainage data for accurate predictions</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-left">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Comprehensive Assessment</h3>
              <p className="text-gray-500">Get flood severity levels, waterlogging duration predictions, and safety recommendations</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Real-Time Alerts</h3>
              <p className="text-gray-500">Receive instant notifications when flood risk levels change in your monitored areas</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-left">
              <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Planner Dashboard</h3>
              <p className="text-gray-500">City planners get district-wide analytics, historical trends, and infrastructure insights</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-left">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center mb-6">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Early Warning System</h3>
              <p className="text-gray-500">Predictive models give advance warning before flood events to help communities prepare</p>
            </div>
          </div>

          <button
            onClick={() => loginRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="px-12 py-4 bg-[#1565c0] text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-[#1a237e] transition"
          >
            Get Started Now
          </button>
        </div>
      </div>

      {/* ===== LOGIN SECTION ===== */}
      <div ref={loginRef} className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a237e] via-[#1565c0] to-[#0288d1]">
        <div className="relative z-10 w-full max-w-md p-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a237e] to-[#0288d1] flex items-center justify-center shadow-lg">
              <Droplets className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-[#e3f2fd]">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0d1b2a] text-center">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-[#1565c0] text-center mt-2 mb-8">
              {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <Input type="text" placeholder="User ID" value={forgotForm.userId} onChange={(e) => setForgotForm({ ...forgotForm, userId: e.target.value })} className="h-14 rounded-xl border-[#bbdefb]" required />
                <Input type="password" placeholder="New Password" value={forgotForm.newPassword} onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })} className="h-14 rounded-xl border-[#bbdefb]" required />
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
                <button type="button" onClick={() => setShowForgotPassword(false)} className="w-full text-center text-[#1565c0] text-sm">
                  Back to Sign In
                </button>
              </form>

            ) : !isSignUp ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input type="text" placeholder="User ID" value={loginForm.userId} onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })} className="pl-12 h-14 rounded-xl border-[#bbdefb]" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="pl-12 pr-12 h-14 rounded-xl border-[#bbdefb]" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl">
                  {loading ? 'Loading...' : 'Sign In'}
                </Button>
                <div className="text-center">
                  <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-[#1565c0]">
                    Forgot Password?
                  </button>
                </div>
              </form>

            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="user" checked={signupForm.type === 'user'} onChange={() => setSignupForm({ ...signupForm, type: 'user' })} />
                    <span>User</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="planner" checked={signupForm.type === 'planner'} onChange={() => setSignupForm({ ...signupForm, type: 'planner' })} />
                    <span>City Planner</span>
                  </label>
                </div>
                <Input type="text" placeholder="Full Name" value={signupForm.fullName} onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })} required />
                <Input type="text" placeholder="User ID" value={signupForm.userId} onChange={(e) => setSignupForm({ ...signupForm, userId: e.target.value })} required />
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} className="pr-12 h-12 rounded-xl border-[#bbdefb]" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <div className="relative">
                  <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} className="pr-12 h-12 rounded-xl border-[#bbdefb]" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl">
                  {loading ? 'Loading...' : 'Create Account'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-[#1565c0]">
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}