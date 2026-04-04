import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Droplets, UserPlus, Zap, Shield, MapPin, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = 'http://localhost:5001';

export default function Home() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const canvasRef = useRef(null);
  
  const [loginForm, setLoginForm] = useState({ userId: '', password: '' });
  const [forgotForm, setForgotForm] = useState({ userId: '', newPassword: '' });
  const [signupForm, setSignupForm] = useState({ fullName: '', userId: '', password: '', confirmPassword: '', district: 'Hyderabad', state: 'Telangana', type: 'user', access: '' });

  // Check if already logged in – use client-side navigation to avoid full reload
  useEffect(() => {
    const storedUser = sessionStorage.getItem('floodsense_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.type === 'planner') {
        navigate('/PlannerDashboard');
      } else {
        navigate('/UserDashboard');
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
      sessionStorage.setItem('floodsense_user', JSON.stringify(user));
      if (user.type === 'planner') {
        navigate('/PlannerDashboard');
      } else {
        navigate('/UserDashboard');
      }
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
          type: signupForm.type,
          // send either access (planner) or district/state (user)
          ...(signupForm.type === 'planner'
            ? { access: signupForm.access }
            : { district: signupForm.district, state: signupForm.state }),
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
      // redirect based on account type
      if (user.type === 'planner') {
        navigate('/PlannerDashboard');
      } else {
        navigate('/UserDashboard');
      }
    } catch (err) {
      setError('Network error. Ensure backend is running on port 5001.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Animated Gradient Background */}
      <div className="relative lg:w-1/2 min-h-[300px] lg:min-h-screen bg-gradient-to-br from-[#1a237e] via-[#1565c0] to-[#0288d1] flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        
        <div className="relative z-10 text-center px-8 py-12 lg:py-0">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Droplets className="w-16 h-16 lg:w-24 lg:h-24 text-white" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white rounded-sm" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-4">FloodSense</h1>
          <p className="text-white/80 text-lg lg:text-xl font-light mb-8">AI-Powered Urban Flood Intelligence</p>
          
          {/* Feature highlights */}
          <div className="hidden lg:grid grid-cols-2 gap-4 mt-12 max-w-md mx-auto">
            {[
              { icon: Zap, text: 'Real-time Predictions' },
              { icon: MapPin, text: 'Location-based Analysis' },
              { icon: BarChart3, text: 'Historical Trends' },
              { icon: Shield, text: 'Risk Assessment' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/70 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <feature.icon className="w-5 h-5" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Wave SVG at bottom for mobile */}
        <svg className="absolute bottom-0 left-0 w-full lg:hidden" viewBox="0 0 1440 100" fill="none">
          <path d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,60 1440,50 L1440,100 L0,100 Z" fill="white"/>
        </svg>
      </div>
      
      {/* Right Side - Login/Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a237e] to-[#0288d1] flex items-center justify-center shadow-lg">
              <Droplets className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-[#e3f2fd]">
            {/* Hidden Logo for Desktop */}
            <div className="hidden lg:flex justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a237e] to-[#0288d1] flex items-center justify-center shadow-lg">
                <Droplets className="w-10 h-10 text-white" />
              </div>
            </div>
            
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
            
            {!isSignUp ? (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input
                    type="text"
                    placeholder="User ID"
                    value={loginForm.userId}
                    onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                    className="pl-12 h-14 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20 text-[#0d1b2a] placeholder:text-[#90caf9]"
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
                    className="pl-12 pr-12 h-14 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20 text-[#0d1b2a] placeholder:text-[#90caf9]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1565c0] hover:text-[#0288d1] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setError(''); }}
                    className="text-xs text-[#1565c0] hover:text-[#0288d1] font-medium"
                  >
                    Forgot password?
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
                    'Sign In'
                  )}
                </Button>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignup} className="space-y-4">
                {/* account type selection */}
                <div className="flex items-center gap-6 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="accountType"
                      value="user"
                      checked={signupForm.type === 'user'}
                      onChange={() => setSignupForm({ ...signupForm, type: 'user' })}
                    />
                    <span>User</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="accountType"
                      value="planner"
                      checked={signupForm.type === 'planner'}
                      onChange={() => setSignupForm({ ...signupForm, type: 'planner' })}
                    />
                    <span>City Planner</span>
                  </label>
                </div>

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
                    placeholder="User ID"
                    value={signupForm.userId}
                    onChange={(e) => setSignupForm({ ...signupForm, userId: e.target.value })}
                    className="pl-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                    required
                  />
                </div>
                
                {signupForm.type === 'user' && (
                  <>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                      <Input
                        type="text"
                        placeholder="District (optional)"
                        value={signupForm.district}
                        onChange={(e) => setSignupForm({ ...signupForm, district: e.target.value })}
                        className="pl-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                      <select
                        value={signupForm.state}
                        onChange={(e) => setSignupForm({ ...signupForm, state: e.target.value })}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20 bg-background text-foreground"
                      >
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                      </select>
                    </div>
                  </>
                )}
                {signupForm.type === 'planner' && (
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                    <Input
                      type="text"
                      placeholder="Planner access (state/region)"
                      value={signupForm.access}
                      onChange={(e) => setSignupForm({ ...signupForm, access: e.target.value })}
                      className="pl-12 h-12 rounded-xl border-[#bbdefb] focus:border-[#0288d1] focus:ring-[#0288d1]/20"
                      required={signupForm.type === 'planner'}
                    />
                  </div>
                )}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1565c0]" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
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
                    'Create Account'
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
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

            {showForgotPassword && !isSignUp && (
              <div className="mt-6 p-4 bg-[#e3f2fd] rounded-xl border border-[#bbdefb]">
                <p className="text-xs font-semibold text-[#0d1b2a] mb-3">Reset password</p>
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <Input
                    type="text"
                    placeholder="User ID"
                    value={forgotForm.userId}
                    onChange={(e) => setForgotForm({ ...forgotForm, userId: e.target.value })}
                    className="h-10 rounded-lg border-[#bbdefb] focus:border-[#0288d1]"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="New password"
                    value={forgotForm.newPassword}
                    onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                    className="h-10 rounded-lg border-[#bbdefb] focus:border-[#0288d1]"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setShowForgotPassword(false); setForgotForm({ userId: '', newPassword: '' }); }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={loading}>
                      {loading ? 'Saving...' : 'Update password'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Demo Credentials - stored in backend data/users.json */}
          <div className="mt-6 p-4 bg-[#e3f2fd] rounded-xl">
            <p className="text-xs text-[#1565c0] font-medium mb-2">Demo credentials:</p>
            <div className="grid grid-cols-1 gap-2 text-xs text-[#0d1b2a]">
              <div className="flex justify-between">
                <span>User:</span>
                <span className="font-mono">arjun.sharma / Flood@2024</span>
              </div>
              <div className="flex justify-between">
                <span>Planner / Admin:</span>
                <span className="font-mono">admin.floodsense / FloodSense@Master</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}