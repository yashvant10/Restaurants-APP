import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, MapPin, ShoppingBag, Menu, X, Star, Clock, ShieldCheck, 
  Heart, Plus, Minus, Trash2, User, ArrowRight, 
  ChefHat, Bike, Sparkles, CheckCircle2, ChevronRight,
  Percent, Eye, EyeOff, MessageSquare
} from 'lucide-react';
import heroImg from '../assets/hero_food.png';
import RestaurantCard from '../components/RestaurantCard';

// Premium high-fidelity dish data for exploration menu
const DISHES = [
  {
    id: 1,
    name: "Truffle Honey & Pepperoni Pizza",
    category: "pizza",
    price: 18.99,
    rating: 4.9,
    reviews: 142,
    time: "20-25 min",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
    badge: "Bestseller",
    description: "Artisanal crust, black truffle honey, spicy double pepperoni, fresh mozzarella, wild oregano."
  },
  {
    id: 2,
    name: "Wagyu Truffle Umami Burger",
    category: "burgers",
    price: 21.50,
    rating: 4.9,
    reviews: 289,
    time: "15-20 min",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
    badge: "Premium Choice",
    description: "Aged Wagyu beef, truffle aioli, caramelized onions, melted gruyère, toasted brioche bun."
  },
  {
    id: 3,
    name: "Vibrant Summer Avocado Salad",
    category: "healthy",
    price: 14.25,
    rating: 4.7,
    reviews: 95,
    time: "10-15 min",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600",
    badge: "Vegan Friendly",
    description: "Organic mixed greens, Hass avocado, heirloom cherry tomatoes, roasted pumpkin seeds, citrus-dill vinaigrette."
  },
  {
    id: 4,
    name: "Signature Spicy Salmon Sushi",
    category: "sushi",
    price: 24.00,
    rating: 4.8,
    reviews: 184,
    time: "25-30 min",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600",
    badge: "Chef's Special",
    description: "Torched organic salmon, house spicy glaze, jalapeño slices, premium sushi rice, toasted seaweed."
  },
  {
    id: 5,
    name: "Burrata & Prosciutto Altamura",
    category: "healthy",
    price: 17.50,
    rating: 4.8,
    reviews: 83,
    time: "15-20 min",
    image: "https://images.unsplash.com/photo-1629732047847-50b7ecf0cbf1?auto=format&fit=crop&q=80&w=600",
    badge: "Trending",
    description: "Creamy Burrata di Andria, San Daniele prosciutto, organic baby arugula, balsamic glaze, toasted sourdough."
  },
  {
    id: 6,
    name: "Golden Truffle Pecorino Fries",
    category: "trending",
    price: 9.99,
    rating: 4.6,
    reviews: 312,
    time: "10-15 min",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600",
    badge: "Top Rated",
    description: "Crispy skin-on potatoes, white truffle oil, shaved pecorino cheese, fresh garden rosemary."
  },
  {
    id: 7,
    name: "Double Cheese Smash Burger",
    category: "burgers",
    price: 15.99,
    rating: 4.8,
    reviews: 204,
    time: "15-20 min",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=600",
    badge: "Classic",
    description: "Two smashed beef patties, double cheddar cheese, secret house sauce, pickles, toasted sesame bun."
  },
  {
    id: 8,
    name: "Artisanal Margherita Pizza",
    category: "pizza",
    price: 15.50,
    rating: 4.7,
    reviews: 128,
    time: "15-20 min",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&q=80&w=600",
    badge: "Vegetarian",
    description: "San Marzano tomatoes, fresh buffalo mozzarella, organic sweet basil, extra virgin olive oil."
  }
];

const REVIEWS = [
  {
    id: 1,
    name: "Sophia Martinez",
    role: "Food Blogger",
    comment: "The speed of delivery is unmatched, but what really blew me away was the restaurant selection. It's actual gourmet cuisine, still piping hot when it arrived!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 2,
    name: "Chef Marcus Sterling",
    role: "Michelin-Starred Chef",
    comment: "Partnering with this platform was the best decision. Their strict packaging guidelines and rapid couriers preserve the delicate textures of high-end gastronomy.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 3,
    name: "Liam Henderson",
    role: "Software Architect",
    comment: "The real-time tracking widget is incredibly precise. I can see the exact coordinate of the courier, and the delivery prediction is accurate down to the minute.",
    rating: 4.8,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  }
];

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Global States
  const [theme, setTheme] = useState('light');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Category Filtering States
  const [activeCategory, setActiveCategory] = useState('all');

  // Favorites States
  const [favorites, setFavorites] = useState([1, 4]);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  // Live Tracking Simulator State
  const [trackingState, setTrackingState] = useState('idle'); // 'idle' | 'prep' | 'transit' | 'arrived'
  const [trackingProgress, setTrackingProgress] = useState(0);

  // Mock Restaurants for Preview Section
  const mockRestaurants = [
    {
      id: '1',
      name: 'Spice Garden',
      cuisine: 'Indian • Curry • Tandoori',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      rating: '4.8',
      deliveryTime: '20-30 Mins'
    },
    {
      id: '2',
      name: 'Pizza Palace',
      cuisine: 'Italian • Pizza • Pasta',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      rating: '4.6',
      deliveryTime: '15-25 Mins'
    },
    {
      id: '3',
      name: 'Dragon Bowl',
      cuisine: 'Chinese • Noodles • Dim Sum',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      rating: '4.4',
      deliveryTime: '25-35 Mins'
    },
    {
      id: '4',
      name: 'Burger Hub',
      cuisine: 'American • Burgers • Fries',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      rating: '4.7',
      deliveryTime: '10-20 Mins'
    }
  ];

  // Theme Syncing
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Scroll listener for sticky glassy navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search input autocompletes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const filtered = DISHES.filter(
        dish => dish.name.toLowerCase().includes(query.toLowerCase()) || 
                dish.category.toLowerCase().includes(query.toLowerCase())
      ).map(d => d.name);
      
      const generic = ["Gourmet Pizza", "Premium Burgers", "Healthy Bowls", "Japanese Sushi"].filter(c => 
        c.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions([...new Set([...filtered, ...generic])].slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (val) => {
    setSearchQuery(val);
    setShowSuggestions(false);
    
    const matchingCategory = ['pizza', 'burgers', 'sushi', 'healthy', 'trending'].find(
      cat => val.toLowerCase().includes(cat)
    );
    if (matchingCategory) {
      setActiveCategory(matchingCategory);
    } else {
      setActiveCategory('all');
    }
    
    const menuSection = document.getElementById('explore-menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cart operations
  const toggleFavorite = (dishId) => {
    setFavorites(prev => 
      prev.includes(dishId) ? prev.filter(id => id !== dishId) : [...prev, dishId]
    );
  };

  // Live Tracker Simulator
  const simulateTracking = () => {
    setTrackingState('prep');
    setTrackingProgress(15);
    
    setTimeout(() => {
      setTrackingState('transit');
      setTrackingProgress(60);
    }, 5000);

    setTimeout(() => {
      setTrackingState('arrived');
      setTrackingProgress(100);
    }, 11000);
  };

  // Newsletter Submit
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('loading');
    setTimeout(() => {
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 4000);
    }, 1500);
  };

  // Handle click on View Menu / Order Now for mock restaurants
  const handleRestaurantAction = (restaurant) => {
    if (isAuthenticated && user) {
      if (user.role === 'restaurant') {
        navigate('/restaurant-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  // Filtered dishes
  const filteredDishes = DISHES.filter(dish => {
    if (activeCategory === 'all') return true;
    return dish.category === activeCategory;
  });

  return (
    <div className="min-h-screen transition-colors duration-500 bg-[#FAF9F6] text-slate-900 dark:bg-[#090A0F] dark:text-[#E2E8F0] selection:bg-rose-500 selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Dynamic Gourmet Ambient Glow Blobs */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-200px] left-[5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-amber-500/10 to-rose-500/10 dark:from-amber-500/5 dark:to-rose-500/5 blur-[120px] animate-[pulse_8s_infinite]"></div>
        <div className="absolute top-[100px] right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-rose-500/8 to-orange-500/8 dark:from-rose-500/3 dark:to-orange-500/3 blur-[140px] animate-[pulse_12s_infinite]"></div>
      </div>

      {/* 1. RESPONSIVE STICKY NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'py-4 bg-[#FAF9F6]/80 dark:bg-[#090A0F]/80 backdrop-blur-xl border-b border-rose-500/10 dark:border-rose-500/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]' 
          : 'py-6 bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 bg-clip-text text-transparent">
                Velociti<span className="text-slate-900 dark:text-white">Bites</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-9">
              <a href="#explore-menu" className="font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-300">Home</a>
              <a href="#features" className="font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-300">Features</a>
              <a href="#restaurants" className="font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-300">Restaurants</a>
              <a href="#testimonials" className="font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-300">Contact</a>
              
              {/* Vertical divider */}
              <span className="h-5 w-px bg-slate-200 dark:bg-slate-800"></span>

              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/60 dark:hover:bg-slate-900 hover:text-rose-500 transition-colors duration-300 cursor-pointer border border-slate-200/40 dark:border-slate-800/40"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? (
                  <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                )}
              </button>

              {/* Auth Controls */}
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3 bg-white/70 dark:bg-slate-900/40 p-1.5 pl-4 pr-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Hi, {(user.fullName || '').split(' ')[0] || 'Gourmet'}</span>
                  <button 
                    onClick={() => {
                      if (user.role === 'restaurant') {
                        navigate('/restaurant-dashboard');
                      } else {
                        navigate('/customer-dashboard');
                      }
                    }}
                    className="text-xs font-black bg-gradient-to-r from-amber-500 to-rose-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-rose-500/10 active:scale-95 transition-all cursor-pointer"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={logout}
                    className="text-xs font-bold text-slate-500 hover:text-rose-500 px-2 py-1 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login"
                    className="text-slate-700 dark:text-slate-200 hover:text-rose-500 font-bold text-xs uppercase tracking-widest transition-colors duration-300"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-widest px-5.5 py-3.5 rounded-xl hover:shadow-lg hover:shadow-rose-500/15 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-3 md:hidden">
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 text-slate-750 dark:text-slate-300"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 text-slate-750 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5.5 h-5.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAF9F6] dark:bg-[#090A0F] border-b border-slate-200 dark:border-slate-800 shadow-2xl py-5 px-5 flex flex-col space-y-4">
            <a href="#explore-menu" onClick={() => setMobileMenuOpen(false)} className="font-bold text-sm uppercase tracking-widest py-2 border-b border-slate-200/20 text-slate-800 dark:text-slate-200">Home</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="font-bold text-sm uppercase tracking-widest py-2 border-b border-slate-200/20 text-slate-800 dark:text-slate-200">Features</a>
            <a href="#restaurants" onClick={() => setMobileMenuOpen(false)} className="font-bold text-sm uppercase tracking-widest py-2 border-b border-slate-200/20 text-slate-800 dark:text-slate-200">Restaurants</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="font-bold text-sm uppercase tracking-widest py-2 border-b border-slate-200/20 text-slate-800 dark:text-slate-200">Contact</a>
            
            {isAuthenticated && user ? (
              <div className="flex flex-col space-y-3 pt-2">
                <span className="font-bold text-xs text-slate-500">Hi, {user.fullName || 'Gourmet'}</span>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user.role === 'restaurant') {
                      navigate('/restaurant-dashboard');
                    } else {
                      navigate('/customer-dashboard');
                    }
                  }}
                  className="bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-sm py-4.5 rounded-xl w-full text-center shadow-lg shadow-rose-500/10"
                >
                  Go to Dashboard
                </button>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-rose-500 font-extrabold text-xs uppercase tracking-widest text-center py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="border border-slate-200 dark:border-slate-800 text-center font-bold text-sm uppercase tracking-widest py-4 rounded-xl text-slate-800 dark:text-white"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl text-center shadow-lg shadow-rose-500/10"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

           <section className="relative pt-36 pb-24 md:pt-44 md:pb-36 overflow-hidden">
        {/* Decorative Grid Mesh Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Value Proposition & CTA Column */}
            <div className="lg:col-span-7 flex flex-col text-center lg:text-left">
              {/* Tagline micro-capsule */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/10 to-rose-500/10 text-amber-600 dark:text-amber-400 px-4.5 py-2 rounded-full self-center lg:self-start mb-8 font-extrabold text-[10px] uppercase tracking-widest border border-rose-500/20 shadow-sm backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                <span>Premium Gastronomy On-Demand</span>
              </div>

              {/* Bold Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06] mb-6 text-slate-900 dark:text-white">
                Bespoke Gastronomy <br className="hidden sm:inline" />
                Delivered To Your{' '}
                <span className="relative inline-block mt-1 sm:mt-0">
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 bg-clip-text text-transparent">
                    Doorstep.
                  </span>
                  <span className="absolute bottom-1 left-0 w-full h-[6px] bg-gradient-to-r from-amber-400 to-rose-500 rounded-full opacity-40 blur-[1px]"></span>
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-9 leading-relaxed font-medium">
                Indulge in master-chef culinary plates delivered directly to your home in under 20 minutes inside advanced induction-heated visual packs.
              </p>

              {/* Interactive Search Bar & Address lookup */}
              <div className="relative max-w-2xl w-full mx-auto lg:mx-0 mb-10 z-30">
                <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-white/90 dark:bg-[#12141D]/90 backdrop-blur-md shadow-2xl border border-slate-200/50 dark:border-slate-800/80 focus-within:border-rose-500/30 transition-all duration-300">
                  {/* Search input */}
                  <div className="relative flex-grow flex items-center px-3 min-h-[52px]">
                    <MapPin className="w-5 h-5 text-rose-500 mr-2.5 flex-shrink-0" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => { if (searchQuery.trim().length > 1) setShowSuggestions(true); }}
                      placeholder="Enter gourmet cuisine, dish name, or address..." 
                      className="bg-transparent text-sm w-full outline-none font-semibold focus:ring-0 placeholder-slate-400 dark:placeholder-slate-550 dark:text-white"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                  </div>
                  
                  {/* Action CTA button */}
                  <button 
                    onClick={() => selectSuggestion(searchQuery || 'trending')}
                    className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-widest px-8 py-4 sm:py-0 rounded-xl transition-all duration-300 shadow-md shadow-rose-500/10 flex items-center justify-center space-x-2.5 cursor-pointer whitespace-nowrap min-h-[52px] active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Cuisine</span>
                  </button>
                </div>

                {/* Autocomplete suggestions box */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-[#12141D] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/60 dark:border-slate-800/80 py-3 z-40 max-h-60 overflow-y-auto backdrop-blur-md">
                    {suggestions.map((val, idx) => (
                      <button 
                        key={idx}
                        onClick={() => selectSuggestion(val)}
                        className="w-full text-left px-5 py-3 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 transition-colors duration-200 flex items-center space-x-3.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-slate-700 dark:text-slate-200">{val}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick CTAs for Menu & Login */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-12">
                <button 
                  onClick={() => {
                    if (isAuthenticated && user) {
                      if (user.role === 'restaurant') navigate('/restaurant-dashboard');
                      else navigate('/customer-dashboard');
                    } else {
                      navigate('/login');
                    }
                  }}
                  className="bg-gradient-to-r from-amber-500 to-rose-600 hover:shadow-lg hover:shadow-rose-500/25 text-white font-extrabold text-xs uppercase tracking-widest px-8 py-4.5 rounded-xl transition-all duration-300 flex items-center space-x-2.5 transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
                
                <a 
                  href="#explore-menu"
                  className="bg-white/80 hover:bg-slate-100/90 text-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:text-slate-100 font-extrabold text-xs uppercase tracking-widest px-8 py-4.5 rounded-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-800/80 cursor-pointer text-center backdrop-blur-xs hover:-translate-y-0.5 active:scale-95"
                >
                  Explore Menu
                </a>
              </div>

              {/* Premium social proof counters */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-7 border-t border-slate-200/60 dark:border-slate-800/60 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">20 min</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1.5">Average Delivery</div>
                </div>
                <div className="text-center lg:text-left border-x border-slate-200/60 dark:border-slate-800/60 px-4">
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">150+</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1.5">Vetted Kitchens</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">4.9 ★</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1.5">50k+ Happy Diners</div>
                </div>
              </div>
            </div>

            {/* Showcase Image Column */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex justify-center items-center">
              {/* Behind-image glow ring */}
              <div className="absolute w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] rounded-full bg-gradient-to-tr from-amber-500/20 to-rose-500/20 blur-xl"></div>
              <div className="absolute w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full border border-dashed border-rose-500/30 animate-[spin_40s_linear_infinite] pointer-events-none"></div>

              {/* Premium image panel */}
              <div className="relative z-10 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full p-3 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-[#12141D] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] transform hover:scale-[1.01] transition-transform duration-500">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-[#090A0F] shadow-inner">
                  <img 
                    src={heroImg} 
                    alt="Signature Gourmet Dishes Showcase" 
                    className="w-full h-full object-cover select-none scale-[1.06] hover:scale-[1.12] transition-transform duration-700" 
                  />
                </div>

                {/* Floating status capsules */}
                <div className="absolute -top-3 -right-3 sm:-right-4 bg-white/90 dark:bg-[#12141D]/90 backdrop-blur-md px-4.5 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2.5 border border-slate-200/50 dark:border-slate-800/80 animate-[bounce_6s_infinite]">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
                  <div className="text-left">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kitchen Status</div>
                    <div className="text-xs font-black text-slate-800 dark:text-white">142 Chefs Online</div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-3 sm:-left-4 bg-gradient-to-r from-amber-500 to-rose-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 transform -rotate-3 hover:rotate-0 transition-all duration-300">
                  <Percent className="w-5 h-5 bg-white/20 p-1 rounded-lg" />
                  <div className="text-left">
                    <div className="text-[9px] font-extrabold uppercase tracking-widest text-amber-100">VelocitiCode</div>
                    <div className="text-xs font-black">FIRST50 (50% Off)</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 bg-slate-100/50 dark:bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-rose-500 mb-3 font-semibold">Velociti Advantage</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Designed to satisfy the most demanding epicurean desires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1: Fast Delivery */}
            <div className="group bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-2xl hover:border-rose-500/20 transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Ultra-Fast 20 Min Delivery</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Equipped with hyper-localized satellite kitchens and specialized thermal induction courier kits, your meals arrive at the exact temperature the chef intended.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Average under 20-min fulfillment</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Feature 2: Trusted Quality */}
            <div className="group bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-2xl hover:border-rose-500/20 transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-7 h-7 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Trusted & Vetted Quality</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Only restaurants passing our meticulous food safety audit, hygiene evaluation, and a blind taste-test panel are invited to partner on our platform.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-rose-600 dark:text-rose-450">
                <span>100% certified hygiene check</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Feature 3: Easy Online Ordering */}
            <div className="group bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-2xl hover:border-rose-500/20 transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-7 h-7 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Easy Online Ordering</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Add delicious food plates directly to your cart in one tap, experience automatic checkout calculation, and complete security validation instantly.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-rose-600 dark:text-rose-450">
                <span>Seamless interactive billing</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Feature 4: Live Order Tracking (Simulation) */}
            <div className="group bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-2xl hover:border-rose-500/20 transition-all duration-300 flex flex-col justify-between text-left">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Bike className="w-7 h-7 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Live Order Tracking</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Experience complete peace of mind. Watch your order simulate live updates in real time using our mock radar simulation tool below.
                </p>
                
                {/* Live Tracker Widget Box */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400">Simulation Status</span>
                    <span className="text-[10px] font-extrabold text-rose-500">
                      {trackingState === 'idle' ? 'No Order' : trackingState === 'prep' ? 'Kitchen Cooking' : trackingState === 'transit' ? 'Rider Transit' : 'Arrived! 🎉'}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-3 relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-1000 ease-out"
                      style={{ width: `${trackingProgress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-slate-400 text-[9px] font-bold">
                    <span className={trackingProgress >= 15 ? 'text-amber-500' : ''}>Cooking</span>
                    <span className={trackingProgress >= 60 ? 'text-rose-500' : ''}>On the way</span>
                    <span className={trackingProgress >= 100 ? 'text-green-500' : ''}>Arrived</span>
                  </div>

                  {trackingState === 'idle' || trackingState === 'arrived' ? (
                    <button 
                      onClick={simulateTracking}
                      className="mt-3 w-full bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 font-extrabold text-[9px] uppercase py-1.5 rounded-lg transition-all duration-300 cursor-pointer text-center"
                    >
                      {trackingState === 'arrived' ? 'Restart Tracker' : 'Test Dispatch Radar'}
                    </button>
                  ) : (
                    <div className="mt-3 text-center text-[9px] font-bold text-slate-400 animate-pulse">
                      Simulating live updates...
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. POPULAR RESTAURANTS PREVIEW SECTION */}
      <section id="restaurants" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-500 mb-3 font-semibold">Local Curated Flavors</h2>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Popular Restaurants Near You</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">
            Order from the highest-rated kitchens in your area. Each partner is strictly vetted for culinary excellence, food safety, and ultra-fast packaging standards.
          </p>
        </div>

        {/* Restaurant Card Grid - Responsive mobile-first */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockRestaurants.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant} 
              onViewMenu={handleRestaurantAction}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => handleRestaurantAction(null)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:shadow-lg hover:shadow-rose-500/20 text-white font-extrabold text-sm px-8 py-4 rounded-2xl transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>View All Vetted Restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 5. INTERACTIVE MENU EXPLORATION LIBRARY */}
      <section id="explore-menu" className="py-28 bg-[#FAF9F6] dark:bg-[#0B0C10] relative overflow-hidden">
        {/* Subtle mesh background glows */}
        <div className="absolute bottom-[-100px] left-[-50px] w-96 h-96 bg-amber-500/5 dark:bg-amber-500/3 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-[100px] right-[-50px] w-96 h-96 bg-rose-500/5 dark:bg-rose-500/3 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16">
            <div className="text-left max-w-xl">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/10 to-rose-500/10 text-rose-500 dark:text-rose-400 px-4 py-2 rounded-full mb-4 font-bold text-[10px] uppercase tracking-widest border border-rose-500/20 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Epicurean Selection</span>
              </div>
              <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Explore Gourmet Selections
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed font-medium">
                Filter our masterfully prepared specialties instantly by kitchen category. Add dishes to your session securely in one tap.
              </p>
            </div>

            {/* Filter chips */}
            <div className="flex overflow-x-auto no-scrollbar gap-3 mt-8 lg:mt-0 pb-2.5">
              {[
                { id: 'all', label: 'All Dishes' },
                { id: 'trending', label: '🔥 Trending' },
                { id: 'pizza', label: '🍕 Pizza' },
                { id: 'burgers', label: '🍔 Burgers' },
                { id: 'sushi', label: '🍣 Sushi' },
                { id: 'healthy', label: '🥗 Healthy' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-6 py-3 rounded-2xl font-extrabold text-xs whitespace-nowrap transition-all duration-350 cursor-pointer shadow-xs ${
                    activeCategory === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-rose-500/15 transform -translate-y-0.5'
                      : 'bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200/50 dark:bg-[#12141D] dark:text-slate-350 dark:border-slate-800/80 dark:hover:bg-slate-850/80 backdrop-blur-xs'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredDishes.map(dish => {
              const isFav = favorites.includes(dish.id);
              return (
                <div 
                  key={dish.id} 
                  className="group bg-white dark:bg-[#12141D] rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_20px_50px_rgba(244,63,94,0.06)] dark:hover:shadow-[0_20px_50px_rgba(244,63,94,0.03)] hover:-translate-y-2 hover:border-rose-500/20 dark:hover:border-rose-500/15 transition-all duration-500 flex flex-col justify-between text-left"
                >
                  {/* Image with favorite trigger */}
                  <div className="relative h-52 overflow-hidden bg-slate-50 dark:bg-[#090A0F]">
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700 select-none"
                    />
                    {dish.badge && (
                      <span className="absolute top-4 left-4 bg-[#090A0F]/80 backdrop-blur-md text-white font-extrabold text-[8.5px] uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">
                        {dish.badge}
                      </span>
                    )}
                    <button 
                      onClick={() => toggleFavorite(dish.id)}
                      className="absolute top-4 right-4 w-9.5 h-9.5 rounded-xl bg-white/95 dark:bg-[#12141D]/90 backdrop-blur-sm flex items-center justify-center text-slate-700 dark:text-white hover:text-rose-500 dark:hover:text-rose-500 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm border border-slate-100 dark:border-slate-800/50"
                    >
                      <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-550'}`} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Rating / time */}
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
                        <div className="flex items-center space-x-1.5 text-amber-500">
                          <Star className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                          <span className="font-extrabold">{dish.rating}</span>
                          <span className="text-[10px] text-slate-450">({dish.reviews})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-rose-500" />
                          <span>{dish.time}</span>
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 group-hover:text-rose-500 transition-colors duration-300 leading-tight mb-2 min-h-[44px] flex items-center">
                        {dish.name}
                      </h3>
                      <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed mb-5 line-clamp-2 font-medium">
                        {dish.description}
                      </p>
                    </div>

                    {/* Price and Add CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">${dish.price.toFixed(2)}</span>
                      
                      <button 
                        onClick={() => handleRestaurantAction(null)}
                        className="px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-300 flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95 border border-transparent bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white hover:shadow-lg hover:shadow-rose-500/10"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Order Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. HIGH-CONVERSION CTA BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl text-left">
          {/* Decorative glowing blobs */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-block bg-white/20 text-white font-extrabold text-[10px] uppercase px-3.5 py-1.5 rounded-full mb-6 tracking-widest border border-white/10">
              Satisfy Your Cravings
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Hungry? Order Your Favorite Meal Now!
            </h2>
            <p className="text-sm sm:text-base text-rose-50/90 leading-relaxed mb-8 font-medium">
              Experience the fastest gourmet food delivery network. Connect with premium local restaurants and chefs to deliver delicious hot food plates straight to your doorstep instantly.
            </p>

            <button 
              onClick={() => handleRestaurantAction(null)}
              className="bg-slate-900 hover:bg-slate-950 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl cursor-pointer hover:shadow-black/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 bg-slate-100/50 dark:bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-rose-500 mb-3 font-semibold">Epicurean Feedback</h2>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Endorsed by professional palates</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map(review => (
              <div 
                key={review.id} 
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between shadow-lg relative text-left"
              >
                <div className="absolute top-6 right-8 text-slate-200 dark:text-slate-800 text-6xl font-black select-none pointer-events-none font-serif">“</div>
                
                <div>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(review.rating) 
                            ? 'fill-amber-500 text-amber-500' 
                            : 'text-slate-200 dark:text-slate-700'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-350 leading-relaxed italic mb-8 relative z-10 font-medium">
                    "{review.comment}"
                  </p>
                </div>

                <div className="flex items-center space-x-3.5 pt-6 border-t border-slate-100 dark:border-slate-850">
                  <img 
                    src={review.avatar} 
                    alt={review.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 select-none"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-none">{review.name}</h4>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mt-1.5 block">{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. NEWSLETTER CAPTURE HERO BANNER */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl text-left">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 max-w-2xl text-left">
            <div className="inline-block bg-white/20 text-white font-extrabold text-[10px] uppercase px-3.5 py-1.5 rounded-full mb-6 tracking-widest border border-white/10">
              Gourmet Chronicles
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Get secret chef culinary drops & weekly discounts.
            </h2>
            <p className="text-sm sm:text-base text-rose-50/90 leading-relaxed mb-8 font-medium">
              Join 40,000+ gastronomy fans. Subscribe to receive hidden off-menu VIP reservations, weekend discount codes, and culinary storytelling. No spam.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md">
              <input 
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="bg-white text-slate-900 font-medium px-5 py-3.5 rounded-xl outline-none w-full shadow-lg placeholder-slate-400 text-sm focus:ring-2 focus:ring-white/50"
              />
              <button 
                type="submit"
                disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
                className="bg-slate-900 hover:bg-slate-950 text-white font-black text-sm px-7 py-3.5 sm:py-0 rounded-xl transition-all duration-300 shadow-xl whitespace-nowrap cursor-pointer hover:shadow-black/20 flex items-center justify-center"
              >
                {newsletterStatus === 'loading' ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : newsletterStatus === 'success' ? (
                  'Subscribed! 🎉'
                ) : (
                  'Join VIP'
                )}
              </button>
            </form>
            
            {newsletterStatus === 'success' && (
              <p className="text-xs text-amber-100 font-extrabold mt-3 animate-pulse">
                Check your inbox! We've sent a 50% discount voucher code: FIRST50.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 9. PREMIUM FOOTER */}
      <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-slate-900">
            
            {/* Branding Column */}
            <div className="md:col-span-5 text-left">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Velociti<span className="text-rose-500">Bites</span>
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-sm">
                VelocitiBites is a premium on-demand gastronomy platform connecting food enthusiasts with certified master chefs and vetted local kitchens.
              </p>
              
              {/* Social Channels */}
              <div className="flex space-x-3.5">
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors duration-300" aria-label="Facebook">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors duration-300" aria-label="Twitter">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors duration-300" aria-label="Instagram">
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-2 text-left">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">Explore</h4>
              <ul className="space-y-3.5 text-sm font-semibold">
                <li><a href="#explore-menu" className="hover:text-white transition-colors duration-300">Browse Menu</a></li>
                <li><a href="#features" className="hover:text-white transition-colors duration-300">Platform Features</a></li>
                <li><a href="#restaurants" className="hover:text-white transition-colors duration-300">Popular Restaurants</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors duration-300">Contact Us</a></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="md:col-span-2 text-left">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">Support</h4>
              <ul className="space-y-3.5 text-sm font-semibold">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Live Support Chat</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Safety & Hygiene</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Refund Policies</a></li>
              </ul>
            </div>

            {/* Downloads Column */}
            <div className="md:col-span-3 text-left">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">Get App</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Available for free on iOS and Android devices. Download our interactive map tracker app.
              </p>
              
              <div className="flex flex-col space-y-2.5">
                <a href="#" className="flex items-center space-x-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 px-4 py-2 rounded-xl transition-all duration-300">
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35-6.27-6.38-5.23-15.65 2.1-15.93 1.83.07 2.87 1.13 3.86 1.13 1 0 2.45-1.29 4.67-1.07 1.93.1 3.4 1.05 4.14 2.4-3.95 2.37-3.3 7.8.69 9.4-1.03 2.58-2.3 5.15-4.08 7.07zM15.48 4.76c.92-1.12 1.54-2.69 1.37-4.26-1.35.05-2.98.9-3.95 2.03-.84.97-1.58 2.56-1.38 4.1 1.5.12 3.03-.75 3.96-1.87z"/></svg>
                  <div className="text-left">
                    <div className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold">Download on the</div>
                    <div className="text-xs font-extrabold text-white">App Store</div>
                  </div>
                </a>

                <a href="#" className="flex items-center space-x-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 px-4 py-2 rounded-xl transition-all duration-300">
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M5.23 2.04c-.23.23-.38.56-.38.99v17.93c0 .43.15.76.38.99l.06.06L15.34 12v-.12L5.29 1.98l-.06.06zM18.66 8.68l-3.32-1.9L15.34 11.9l3.32-3.22zm2.08 2.08c.55-.31.85-.81.85-1.38v-.12c0-.57-.3-1.07-.85-1.38L18.66 8.68 15.34 11.9l5.4 1.18zm-2.08 2.56l3.32-1.9-5.4-1.18 2.08 3.08z"/></svg>
                  <div className="text-left">
                    <div className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold">Get it on</div>
                    <div className="text-xs font-extrabold text-white">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-10 text-xs text-slate-650 font-bold border-t border-slate-900 mt-10">
            <span>© {new Date().getFullYear()} VelocitiBites Inc. All rights reserved.</span>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-slate-400">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400">Terms of Service</a>
              <a href="#" className="hover:text-slate-400">Chef Standards</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
