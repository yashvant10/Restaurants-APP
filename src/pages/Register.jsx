import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, Shield, ArrowRight, Eye, EyeOff, 
  CheckCircle2, Sparkles, ChefHat, ArrowLeft, AlertCircle, Sun, Moon 
} from 'lucide-react';
import heroImg from '../assets/hero_food.png';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Dark/Light Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  // Sync theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Form Inputs State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '' // 'customer' | 'restaurant'
  });

  // Validation Errors State
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '',
    submit: ''
  });

  // UI Interactive States
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Instantly wipe validation errors once user resumes editing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }));
    }
  };

  // 3. Client-Side Input Fields Validation
  const handleValidation = () => {
    let isValid = true;
    const newErrors = { fullName: '', email: '', password: '', role: '', submit: '' };

    // Full name mandatory check
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
      isValid = false;
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long.';
      isValid = false;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email address is required.';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please supply a valid email format.';
      isValid = false;
    }

    // Password mandatory & length check
    if (!formData.password) {
      newErrors.password = 'Password is required.';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters for security.';
      isValid = false;
    }

    // Role mandatory check
    if (!formData.role) {
      newErrors.role = 'Please select your role (Customer or Restaurant).';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!handleValidation()) {
      return; // Stop form submission if invalid
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: '' }));

    try {
      const result = await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.role
      );
      
      if (result.success) {
        setIsSubmitting(false);
        setShowSuccessModal(true);
      } else {
        setErrors(prev => ({ ...prev, submit: result.error }));
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: 'An unexpected error occurred. Please try again.' }));
      setIsSubmitting(false);
    }
  };

  // Redirect countdown timer
  useEffect(() => {
    let timer;
    if (showSuccessModal && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
    } else if (showSuccessModal && redirectCountdown === 0) {
      navigate('/login');
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal, redirectCountdown, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Dynamic Background visual ornaments */}
      <div className="absolute top-1/4 -left-36 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-36 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Controls: Back button & Theme toggle */}
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

      {/* Main Registration Layout Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50 z-10 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Visual branding showcase panel */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-12 flex-col justify-between text-white overflow-hidden">
          {/* Neon/White glows inside */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-2xl"></div>
          
          {/* Logo brand */}
          <div className="relative z-10 flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-md">
              <ChefHat className="w-5.5 h-5.5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Velociti<span className="text-amber-100">Bites</span>
            </span>
          </div>

          {/* Core benefit stats layout */}
          <div className="relative z-10 my-10 space-y-6">
            <h2 className="text-3xl font-black leading-tight text-white">
              Start your <br />
              VIP culinary <br />
              membership.
            </h2>
            
            <p className="text-xs text-rose-50/90 leading-relaxed font-semibold">
              Create a free account to unlock gourmet delivery under 20 minutes, 50% discount off your first order, and customized dining tracking.
            </p>

            <ul className="space-y-4 pt-4 text-xs font-extrabold text-amber-100">
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>150+ Certified Gourmet Kitchens</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Induction Thermal Courier System</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Real-Time Radar Tracking Map</span>
              </li>
            </ul>
          </div>

          {/* Embedded Image Mock */}
          <div className="relative z-10 w-44 h-44 rounded-full p-1.5 bg-white/20 self-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-inner bg-slate-900">
              <img 
                src={heroImg} 
                alt="Delicious visual mock" 
                className="w-full h-full object-cover scale-[1.08] select-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Registration Input Form card */}
        <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          
          {/* Header titles */}
          <div className="text-left mb-8">
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 px-3.5 py-1.5 rounded-full mb-3.5 font-bold text-[10px] uppercase tracking-wider border border-amber-500/20 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Gourmet Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create Your Account</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Enter your credentials to connect with high-end culinary experiences.
            </p>
          </div>

          {/* Auth Error Banner */}
          {errors.submit && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold p-4 rounded-2xl text-left mb-6 flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Main Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* 1. Full Name Field */}
            <div className="space-y-1.5 text-left">
              <label 
                htmlFor="fullName" 
                className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider"
              >
                Full Name
              </label>
              <div className={`relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 border transition-all duration-300 ${
                errors.fullName 
                  ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/10' 
                  : 'border-slate-200/60 dark:border-slate-800/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10'
              }`}>
                <User className={`w-4 h-4 mr-3 flex-shrink-0 transition-colors ${errors.fullName ? 'text-red-400' : 'text-slate-400'}`} />
                <input 
                  type="text" 
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Auguste Escoffier" 
                  className="bg-transparent text-sm w-full py-3.5 outline-none font-semibold text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                  required
                />
              </div>
              {/* Error message */}
              {errors.fullName && (
                <div className="flex items-center space-x-1.5 text-red-500 text-xs font-bold pl-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.fullName}</span>
                </div>
              )}
            </div>

            {/* 2. Email Address Field */}
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. escoffier@gourmet.com" 
                  className="bg-transparent text-sm w-full py-3.5 outline-none font-semibold text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                  required
                />
              </div>
              {/* Error message */}
              {errors.email && (
                <div className="flex items-center space-x-1.5 text-red-500 text-xs font-bold pl-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* 3. Password Field */}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
              {/* Error message */}
              {errors.password && (
                <div className="flex items-center space-x-1.5 text-red-500 text-xs font-bold pl-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* 4. Role Selection Dropdown (Dropdown implementation) */}
            <div className="space-y-1.5 text-left">
              <label 
                htmlFor="role" 
                className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider"
              >
                Join As (Role Selection)
              </label>
              <div className={`relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 border transition-all duration-300 ${
                errors.role 
                  ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/10' 
                  : 'border-slate-200/60 dark:border-slate-800/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10'
              }`}>
                <Shield className={`w-4 h-4 mr-3 flex-shrink-0 transition-colors ${errors.role ? 'text-red-400' : 'text-slate-400'}`} />
                <select 
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="bg-transparent text-sm w-full py-3.5 outline-none font-semibold text-slate-700 dark:text-slate-350 cursor-pointer placeholder-slate-400 dark:placeholder-slate-650"
                  required
                >
                  <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-400 font-semibold">Select your profile category...</option>
                  <option value="customer" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 font-semibold">Customer (Browse and order food)</option>
                  <option value="restaurant" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 font-semibold">Restaurant (Expose gourmet kitchens)</option>
                </select>
              </div>
              {/* Error message */}
              {errors.role && (
                <div className="flex items-center space-x-1.5 text-red-500 text-xs font-bold pl-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.role}</span>
                </div>
              )}
            </div>

            {/* Custom Role Selection Cards (Higher UX addition for WOW factor) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-300 ${
                  formData.role === 'customer'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-md'
                    : 'bg-transparent border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500'
                }`}
              >
                <div className="text-xs font-black">Customer Profile</div>
                <div className="text-[10px] opacity-80 mt-1 leading-normal">Browse, order meals, track rider.</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'restaurant' }))}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-300 ${
                  formData.role === 'restaurant'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-md'
                    : 'bg-transparent border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500'
                }`}
              >
                <div className="text-xs font-black">Restaurant Kitchen</div>
                <div className="text-[10px] opacity-80 mt-1 leading-normal">Publish menu card and sell gourmet.</div>
              </button>
            </div>

            {/* Submit Action Button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-sm py-4 rounded-xl shadow-lg transition-all duration-300 mt-6 cursor-pointer flex items-center justify-center space-x-2.5 hover:shadow-rose-500/10 hover:shadow-2xl hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>

            {/* Footer link to Login */}
            <div className="text-center pt-4">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-xs font-extrabold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-all cursor-pointer"
              >
                Log In
              </Link>
            </div>

          </form>

        </div>
      </div>

      {/* 9. SUCCESS REDIRECT OVERLAY MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 text-center border border-slate-200/50 dark:border-slate-800/80 shadow-2xl animate-float">
            
            {/* Visual Tick Ring */}
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 mx-auto mb-5 animate-pulse">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-black text-slate-800 dark:text-white">Registration Successful!</h3>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Welcome aboard, <strong>{formData.fullName}</strong>! <br />
              Your premium <strong>{formData.role}</strong> profile has been registered.
            </div>

            {/* Countdown notice */}
            <div className="bg-slate-50 dark:bg-slate-950 py-3 px-5 rounded-2xl mt-6 border border-slate-100 dark:border-slate-850">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Redirecting to Login</span>
              <div className="text-sm font-black text-rose-500 mt-1">in {redirectCountdown} seconds...</div>
            </div>

            {/* Skip action */}
            <button 
              onClick={() => navigate('/login')}
              className="mt-5 text-xs font-extrabold text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              Skip countdown and login now
            </button>
            
          </div>
        </div>
      )}

    </div>
  );
}
