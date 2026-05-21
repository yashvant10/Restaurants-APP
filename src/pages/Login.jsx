import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, 
  ChefHat, ArrowLeft, Sun, Moon, AlertCircle, CheckCircle2, Shield
} from 'lucide-react';
import heroImg from '../assets/hero_food.png';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'customer') {
        navigate('/customer-dashboard', { replace: true });
      } else if (user.role === 'restaurant') {
        navigate('/restaurant-dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // 1. Dark/Light Theme Integration State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  // Sync theme changes with the HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // 2. Form Credentials State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role is customer for custom credentials

  // 3. Validation and Authentication Errors State
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    auth: ''
  });

  // 4. UI Interactive States
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Quick Demo Account Pre-fill Helper
  const fillDemoAccount = (selectedRole) => {
    if (selectedRole === 'customer') {
      setEmail('customer@gourmet.com');
      setPassword('password123');
      setRole('customer');
    } else {
      setEmail('restaurant@gourmet.com');
      setPassword('password123');
      setRole('restaurant');
    }
    // Clear previous errors when pre-filling
    setErrors({ email: '', password: '', auth: '' });
  };

  // Helper to validate Email formatting
  const validateEmail = (emailVal) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(emailVal).toLowerCase());
  };

  // Handle manual input changes and clear respective error indicators
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (errors.auth) {
      setErrors(prev => ({ ...prev, auth: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    if (errors.auth) {
      setErrors(prev => ({ ...prev, auth: '' }));
    }
  };

  // Run Client-Side Validations
  const handleValidation = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', auth: '' };

    // Email checks
    if (!email.trim()) {
      newErrors.email = 'Email Address is required.';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address (e.g., user@gourmet.com).';
      isValid = false;
    }

    // Password checks
    if (!password) {
      newErrors.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Secure Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!handleValidation()) {
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, auth: '' }));

    try {
      const result = await login(email, password);
      
      if (result.success) {
        setLoginSuccess(true);
        
        setTimeout(() => {
          if (result.user.role === 'restaurant') {
            navigate('/restaurant-dashboard', { replace: true });
          } else {
            navigate('/customer-dashboard', { replace: true });
          }
        }, 800);
      } else {
        setErrors(prev => ({ ...prev, auth: result.error }));
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, auth: 'An unexpected error occurred. Please try again.' }));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative Ornaments */}
      <div className="absolute top-1/4 -left-36 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-36 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Bar Navigation & Controls */}
      <div className="absolute top-6 left-6 sm:left-12 flex items-center z-20">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="absolute top-6 right-6 sm:right-12 z-20">
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-sm hover:text-rose-500 hover:scale-105 transition-all cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Dual-Panel Auth Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50 z-10 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Panel: Visual branding showcase (Identical to Register page layout for design unity) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-12 flex-col justify-between text-white overflow-hidden">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-md">
              <ChefHat className="w-5.5 h-5.5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Velociti<span className="text-amber-100">Bites</span>
            </span>
          </div>

          <div className="relative z-10 my-10 space-y-6">
            <h2 className="text-3xl font-black leading-tight text-white">
              Welcome Back <br />
              to Gourmet <br />
              Delights.
            </h2>
            
            <p className="text-xs text-rose-50/90 leading-relaxed font-semibold">
              Access your personal profile, check your actively simulated orders, and customize your gourmand features instantly.
            </p>

            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl space-y-3">
              <span className="text-[9px] uppercase font-black text-amber-200 tracking-wider">Quick Testing Accounts</span>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('customer')}
                  className="w-full text-left py-2 px-3 bg-white/15 hover:bg-white/25 rounded-xl border border-white/10 text-[10px] font-bold flex items-center justify-between transition-all"
                >
                  <span>Customer Tier</span>
                  <span className="opacity-80">customer@gourmet.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('restaurant')}
                  className="w-full text-left py-2 px-3 bg-white/15 hover:bg-white/25 rounded-xl border border-white/10 text-[10px] font-bold flex items-center justify-between transition-all"
                >
                  <span>Restaurant Kitchen</span>
                  <span className="opacity-80">restaurant@gourmet.com</span>
                </button>
              </div>
            </div>
          </div>

          {/* Embedded Image Mock */}
          <div className="relative z-10 w-44 h-44 rounded-full p-1.5 bg-white/20 self-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-inner bg-slate-900">
              <img 
                src={heroImg} 
                alt="Delicious visual mock" 
                className="w-full h-full object-cover scale-[1.08] select-none"
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Secure Input Form card */}
        <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          
          {/* Header titles */}
          <div className="text-left mb-8">
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 px-3.5 py-1.5 rounded-full mb-3.5 font-bold text-[10px] uppercase tracking-wider border border-amber-500/20 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Secure Authentication</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Access Your Profile</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Enter your credentials or click a demo pre-fill panel on the left to start.
            </p>
          </div>

          {/* Auth Success Banner */}
          {loginSuccess && (
            <div className="bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold p-4 rounded-2xl text-left mb-6 flex items-center space-x-2.5 animate-pulse">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Login successful! Opening your tailored workspace...</span>
            </div>
          )}

          {/* Auth Error Banner */}
          {errors.auth && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold p-4 rounded-2xl text-left mb-6 flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errors.auth}</span>
            </div>
          )}

          {/* Mobile Quick Test account pill indicators */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6 lg:hidden">
            <button
              type="button"
              onClick={() => fillDemoAccount('customer')}
              className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-all text-center"
            >
              Prefill Demo Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('restaurant')}
              className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-all text-center"
            >
              Prefill Demo Restaurant
            </button>
          </div>

          {/* Core Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* 1. Email Input */}
            <div className="space-y-1.5 text-left">
              <label 
                htmlFor="email" 
                className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider"
              >
                Email Address
              </label>
              <div className={`relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 border transition-all duration-300 ${
                errors.email 
                  ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/10' 
                  : 'border-slate-200/60 dark:border-slate-800/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10'
              }`}>
                <Mail className={`w-4 h-4 mr-3 flex-shrink-0 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400'}`} />
                <input 
                  type="email" 
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="e.g. customer@gourmet.com" 
                  className="bg-transparent text-sm w-full py-3.5 outline-none font-semibold text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                  required
                />
              </div>
              {errors.email && (
                <div className="flex items-center space-x-1.5 text-red-500 text-xs font-bold pl-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* 2. Password Input */}
            <div className="space-y-1.5 text-left">
              <label 
                htmlFor="password" 
                className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider"
              >
                Password
              </label>
              <div className={`relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 border transition-all duration-300 ${
                errors.password 
                  ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/10' 
                  : 'border-slate-200/60 dark:border-slate-800/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10'
              }`}>
                <Lock className={`w-4 h-4 mr-3 flex-shrink-0 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400'}`} />
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••" 
                  className="bg-transparent text-sm w-full py-3.5 outline-none font-semibold text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-rose-500 focus:outline-none cursor-pointer"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center space-x-1.5 text-red-500 text-xs font-bold pl-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* 3. Role Selector (Dropdown required for custom logins to dictate route destination) */}
            <div className="space-y-1.5 text-left">
              <label 
                htmlFor="role" 
                className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider"
              >
                Access Category (Role Selection)
              </label>
              <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 border border-slate-200/60 dark:border-slate-800/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10">
                <Shield className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                <select 
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-transparent text-sm w-full py-3.5 outline-none font-semibold text-slate-700 dark:text-slate-350 cursor-pointer placeholder-slate-400 dark:placeholder-slate-650"
                  required
                >
                  <option value="customer" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 font-semibold">Customer Dashboard</option>
                  <option value="restaurant" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 font-semibold">Restaurant Panel</option>
                </select>
              </div>
            </div>

            {/* Custom Role selection cards in Login for beautiful synchronization */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3 rounded-2xl border text-left transition-all duration-300 ${
                  role === 'customer'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-md'
                    : 'bg-transparent border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500'
                }`}
              >
                <div className="text-[10px] font-black">Customer</div>
                <div className="text-[9px] opacity-80 mt-0.5">Access user dashboard.</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('restaurant')}
                className={`p-3 rounded-2xl border text-left transition-all duration-300 ${
                  role === 'restaurant'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-md'
                    : 'bg-transparent border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500'
                }`}
              >
                <div className="text-[10px] font-black">Restaurant</div>
                <div className="text-[9px] opacity-80 mt-0.5">Open operational board.</div>
              </button>
            </div>

            {/* Submit Action Button with Spinner */}
            <button 
              type="submit"
              disabled={isSubmitting || loginSuccess}
              className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-sm py-4 rounded-xl shadow-lg transition-all duration-300 mt-6 cursor-pointer flex items-center justify-center space-x-2.5 hover:shadow-rose-500/10 hover:shadow-2xl hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>

            {/* Footer Navigation Link to Register */}
            <div className="text-center pt-4">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Don't have an account? </span>
              <Link 
                to="/register" 
                className="text-xs font-extrabold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-all cursor-pointer"
              >
                Register
              </Link>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}
