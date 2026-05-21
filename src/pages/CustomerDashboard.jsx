import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, Search, Heart, MapPin, Clock, Star, 
  LogOut, Sparkles, ChefHat, User, Sun, Moon, ArrowRight,
  Filter, SlidersHorizontal, ShoppingCart, RefreshCw
} from 'lucide-react';
import RestaurantCard from '../components/RestaurantCard';
import CartDrawer from '../components/CartDrawer';
import api from '../api/axios';

const DISHES = [
  {
    id: 101,
    name: "Truffle Honey & Pepperoni Pizza",
    category: "pizza",
    price: 18.99,
    rating: 4.9,
    time: "20-25 min",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
    description: "Artisanal crust, black truffle honey, spicy double pepperoni, fresh mozzarella, wild oregano."
  },
  {
    id: 102,
    name: "Wagyu Truffle Umami Burger",
    category: "burgers",
    price: 21.50,
    rating: 4.9,
    time: "15-20 min",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
    description: "Aged Wagyu beef, truffle aioli, caramelized onions, melted gruyère, toasted brioche bun."
  },
  {
    id: 103,
    name: "Vibrant Summer Avocado Salad",
    category: "healthy",
    price: 14.25,
    rating: 4.7,
    time: "10-15 min",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600",
    description: "Organic mixed greens, Hass avocado, heirloom cherry tomatoes, roasted pumpkin seeds, citrus-dill vinaigrette."
  },
  {
    id: 104,
    name: "Signature Spicy Salmon Sushi",
    category: "sushi",
    price: 24.00,
    rating: 4.8,
    time: "25-30 min",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600",
    description: "Torched organic salmon, house spicy glaze, jalapeño slices, premium sushi rice, toasted seaweed."
  }
];

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation / UI States
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartVersion, setCartVersion] = useState(0);

  // Search, Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [minRatingFilter, setMinRatingFilter] = useState(false); // true represents 4.5+ ★
  const [fastDeliveryFilter, setFastDeliveryFilter] = useState(false); // true represents under 25 Mins
  const [sortBy, setSortBy] = useState('Popular'); // Popular, Top Rated, Fast Delivery

  // Active / Live Data States
  const [restaurants, setRestaurants] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Sync Cart Quantity Count
  const updateCartCount = useCallback(() => {
    try {
      const stored = localStorage.getItem('velocitibites_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        const items = parsed.items || {};
        const count = Object.values(items).reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    updateCartCount();
  }, [updateCartCount, cartVersion]);

  const handleCartChange = () => {
    setCartVersion(prev => prev + 1);
  };

  // Fetch Restaurants & Customer Orders
  const fetchRestaurants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/restaurants');
      if (!response.ok) {
        throw new Error(`Failed to fetch menus. Server responded with status ${response.status}`);
      }
      const data = await response.json();
      const formattedData = data.map(r => ({
        ...r,
        image: r.image_url || r.image,
        deliveryTime: r.delivery_time || r.deliveryTime
      }));
      setRestaurants(formattedData);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('We encountered an issue retrieving live gourmet listings. Please verify that the FastAPI backend server is online.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveOrders = async () => {
    try {
      // Securely fetch active dispatch tracker orders from the SQLite database
      const response = await api.get('/api/orders/my');
      setActiveOrders(response.data.slice(0, 3)); // show top 3 latest orders
    } catch (err) {
      console.error('Error fetching active customer orders:', err);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchActiveOrders();
  }, []);

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const categories = [
    { name: 'Artisanal Pizza', tag: 'Italian', emoji: '🍕' },
    { name: 'Gourmet Sushi', tag: 'Japanese', emoji: '🍣' },
    { name: 'Prime Burgers', tag: 'American', emoji: '🍔' },
    { name: 'Healthy Bowls', tag: 'Salad', emoji: '🥗' },
    { name: 'Fine Indian', tag: 'Indian', emoji: '🌶️' }
  ];

  // Dynamic filter and sort computations
  const getDeliveryMinutes = (deliveryTimeStr) => {
    // extract digits from string, e.g. "15-25 Mins" -> 25
    if (!deliveryTimeStr) return 30;
    const match = deliveryTimeStr.match(/\d+/g);
    if (!match) return 30;
    return parseInt(match[match.length - 1]); // pick high value of range
  };

  const filteredRestaurants = restaurants.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Cuisine pill match
    const matchesCuisine = selectedCuisine === 'All' || 
                           res.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());

    // Rating threshold filter (4.5+)
    const matchesRating = !minRatingFilter || parseFloat(res.rating) >= 4.5;

    // Delivery limit filter (under 25 mins)
    const matchesDelivery = !fastDeliveryFilter || getDeliveryMinutes(res.deliveryTime) <= 25;

    return matchesSearch && matchesCuisine && matchesRating && matchesDelivery;
  }).sort((a, b) => {
    if (sortBy === 'Top Rated') {
      return parseFloat(b.rating) - parseFloat(a.rating);
    }
    if (sortBy === 'Fast Delivery') {
      return getDeliveryMinutes(a.deliveryTime) - getDeliveryMinutes(b.deliveryTime);
    }
    return 0; // Popular / default mapping
  });

  const handleQuickAdd = (dish) => {
    // Map mock dish category to valid seeded restaurant ID to maintain integrity:
    // Pizza: 2 (Pizza Palace), Burgers: 4 (Burger Hub), Healthy: 1 (Spice Garden), Sushi: 6 (Sushi World)
    let restId = 1;
    if (dish.category === 'pizza') { restId = 2; }
    else if (dish.category === 'burgers') { restId = 4; }
    else if (dish.category === 'sushi') { restId = 6; }

    try {
      const stored = localStorage.getItem('velocitibites_cart');
      let currentItems = {};
      
      if (stored) {
        const parsed = JSON.parse(stored);
        // If current cart belongs to the same restaurant, append. Else, clear and start fresh
        if (parsed.restaurantId === restId) {
          currentItems = parsed.items || {};
        }
      }
      
      const existing = currentItems[dish.id];
      currentItems[dish.id] = {
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: existing ? existing.quantity + 1 : 1
      };
      
      localStorage.setItem('velocitibites_cart', JSON.stringify({
        restaurantId: restId,
        items: currentItems
      }));
      
      setCartVersion(prev => prev + 1);
      updateCartCount();
      setIsCartOpen(true);
    } catch (e) {
      console.error('Quick add failed:', e);
    }
  };

  const RestaurantSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-0 overflow-hidden flex flex-col h-full animate-pulse">
      <div className="h-48 sm:h-52 bg-slate-200 dark:bg-slate-800/60 w-full" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="h-5 bg-slate-200 dark:bg-slate-800/50 rounded-lg w-2/3" />
            <div className="h-5 bg-slate-250 dark:bg-slate-800/70 rounded-full w-12" />
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded-lg w-1/2" />
        </div>
        <div className="h-10 bg-slate-100 dark:bg-slate-800/55 rounded-xl w-full" />
      </div>
    </div>
  );

  const ErrorFallback = ({ onRetry, message }) => (
    <div className="col-span-full bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8 text-center max-w-lg mx-auto my-6 space-y-5">
      <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-md">
        <ChefHat className="w-8 h-8 stroke-[1.5] animate-bounce" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">Connection to Gourmet Kitchen Lost</h3>
        <p className="text-xs text-slate-400 dark:text-slate-550 leading-normal font-semibold">
          {message}
        </p>
      </div>
      <button 
        onClick={onRetry}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
      >
        Retry Connection
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-10 text-center max-w-md mx-auto my-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-405 flex items-center justify-center mx-auto shadow-inner">
        <Search className="w-7 h-7 stroke-[1.5]" />
      </div>
      <div className="space-y-1 text-center">
        <h3 className="text-sm font-black tracking-tight text-slate-800 dark:text-white">No Restaurants Found</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal font-semibold">
          We couldn't find any kitchens matching your filters. Try adjusting your search query or toggling off tags.
        </p>
      </div>
      <button 
        onClick={() => {
          setSelectedCuisine('All');
          setSearchQuery('');
          setMinRatingFilter(false);
          setFastDeliveryFilter(false);
          setSortBy('Popular');
        }}
        className="px-5 py-2.5 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col">
      
      {/* 1. Header Navigation Bar */}
      <nav className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 z-20 px-6 py-4 flex items-center justify-between transition-colors">
        
        {/* Brand identity */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight">
            Velociti<span className="text-rose-500">Bites</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-extrabold bg-rose-500/10 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Customer VIP
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-4">
          <Link to="/profile" className="text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors flex items-center space-x-1">
            <User className="w-3.5 h-3.5" />
            <span className="hidden md:inline">My Profile</span>
          </Link>
          
          {/* Floating Cart Shopping Bag Trigger */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-355 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label="Open Cart Drawer"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse border border-white dark:border-slate-900 shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-855 text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-all cursor-pointer shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:scale-[1.02] transition-all text-xs font-bold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* 2. Main Dashboard Layout Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Banner Welcome */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3.5 text-left">
              <div className="inline-flex items-center space-x-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10">
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span>Gourmet Delivery Network</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Browse Local Flavors</h1>
              <p className="text-xs text-rose-50/90 max-w-md font-semibold leading-relaxed">
                Connect with verified master chefs delivering premium food items straight to your home under 25 minutes.
              </p>
            </div>
            
            {/* User Profile display card */}
            <div className="flex-shrink-0 flex items-center space-x-3.5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/10">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white">{user?.fullName || user?.full_name || 'VIP Customer'}</div>
                <div className="text-[10px] text-rose-100 font-semibold">{user?.email || 'customer@gourmet.com'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Pills & Featured Dishes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Categories Carousel */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Popular Cuisines</h3>
                <button 
                  onClick={() => setSelectedCuisine('All')}
                  className={`text-[10px] font-extrabold hover:underline cursor-pointer ${selectedCuisine === 'All' ? 'text-rose-500 font-black' : 'text-slate-400'}`}
                >
                  Clear Cuisine Filters
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {categories.map((cat, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedCuisine(cat.tag)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                      selectedCuisine === cat.tag 
                        ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 scale-[1.03] shadow-md shadow-rose-500/5' 
                        : 'bg-slate-50 dark:bg-slate-955 border-slate-200/40 dark:border-slate-800/60 hover:border-rose-500/20'
                    }`}
                  >
                    <span className="text-2xl" role="img" aria-label={cat.name}>{cat.emoji}</span>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2">{cat.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Dishes Section */}
            <div className="space-y-4.5 text-left mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Featured Culinary Variety</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DISHES.map(dish => (
                  <div key={dish.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex space-x-4 hover:border-amber-500/30 transition-all">
                    <img src={dish.image} alt={dish.name} className="w-20 h-20 rounded-xl object-cover shadow-sm flex-shrink-0" />
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div>
                        <div className="font-black text-xs text-slate-850 dark:text-white leading-tight truncate">{dish.name}</div>
                        <div className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-1 line-clamp-2 leading-relaxed">{dish.description}</div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/30">
                        <span className="font-extrabold text-xs text-rose-500">${dish.price.toFixed(2)}</span>
                        <button 
                          onClick={() => handleQuickAdd(dish)}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          Quick Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Search & Filtering Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm text-left space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Real-time search */}
                <div className="relative flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 border border-slate-200/60 dark:border-slate-800/80 shadow-inner">
                  <Search className="w-4.5 h-4.5 text-slate-400 mr-2 flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search gourmet restaurants or cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs w-full py-3.5 outline-none font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-650 font-black text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Sort By:</span>
                  </span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 outline-none"
                  >
                    <option value="Popular">Popular (Default)</option>
                    <option value="Top Rated">Top Rated ★</option>
                    <option value="Fast Delivery">Fast Delivery ⚡</option>
                  </select>
                </div>
              </div>

              {/* Toggle Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-rose-500" />
                  <span>Filters:</span>
                </span>

                <button 
                  onClick={() => setMinRatingFilter(!minRatingFilter)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black tracking-wide transition-all border cursor-pointer ${
                    minRatingFilter 
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400' 
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-505 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  Rating 4.5+ ★
                </button>

                <button 
                  onClick={() => setFastDeliveryFilter(!fastDeliveryFilter)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black tracking-wide transition-all border cursor-pointer ${
                    fastDeliveryFilter 
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400' 
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-505 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  Fast Delivery (&lt; 25 mins)
                </button>

                {(searchQuery || selectedCuisine !== 'All' || minRatingFilter || fastDeliveryFilter) && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCuisine('All');
                      setMinRatingFilter(false);
                      setFastDeliveryFilter(false);
                    }}
                    className="text-[10px] font-extrabold text-rose-500 hover:underline uppercase px-2 py-1 cursor-pointer"
                  >
                    Reset Grid
                  </button>
                )}
              </div>
            </div>

            {/* Restaurants Grid Section */}
            <div className="space-y-4.5 text-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {filteredRestaurants.length} Restaurants Matches Near You
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <RestaurantSkeleton key={idx} />
                  ))
                ) : error ? (
                  <ErrorFallback onRetry={fetchRestaurants} message={error} />
                ) : filteredRestaurants.length === 0 ? (
                  <EmptyState />
                ) : (
                  filteredRestaurants.map(restaurant => (
                    <RestaurantCard 
                      key={restaurant.id} 
                      restaurant={restaurant} 
                      onViewMenu={(res) => navigate(`/menu/${res.id}`)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Live Active Dispatch tracker feed from database */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 text-left">Active Dispatch Tracker</h3>
                <button 
                  onClick={fetchActiveOrders}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label="Refresh Active Orders"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3.5">
                {activeOrders.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-center border border-slate-150/40 dark:border-slate-850/60">
                    <p className="text-[10px] text-slate-450 dark:text-slate-550 font-bold">
                      No active dispatches. Order a culinary masterpiece to track it live!
                    </p>
                  </div>
                ) : (
                  activeOrders.map(order => (
                    <div 
                      key={order.id}
                      onClick={() => navigate(`/order-tracker/${order.id}`)}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-slate-800/40 hover:border-rose-500/35 transition-all text-left cursor-pointer hover:scale-[1.01]"
                    >
                      <div className="flex items-center space-x-3.5 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{order.restaurant_name}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                            Order ID: #{order.id} • Grand Total: ${order.total_amount?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 pl-3">
                        <span className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          ['pending', 'placed', 'preparing', 'accepted', 'delivering'].includes(order.status?.toLowerCase()) 
                            ? 'bg-rose-500/10 text-rose-500 animate-pulse border border-rose-500/20' 
                            : 'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}>
                          {order.status}
                        </span>
                        <div className="text-[9px] text-slate-450 dark:text-slate-505 mt-1 font-extrabold uppercase">ETA: {order.estimated_time || '25 Mins'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            
            {/* Quick search container */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-3 text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Search Food & Chefs</h3>
              <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 border border-slate-200/60 dark:border-slate-800/80">
                <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Craving truffle tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs w-full py-3 outline-none font-bold text-slate-700 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
              <p className="text-[9px] text-slate-455 dark:text-slate-500 font-semibold leading-normal">
                Search queries automatically filters matching kitchens on your dashboard grid instantly.
              </p>
            </div>

            {/* Savings & VIP status stats */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-5 text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">VIP Benefit Summary</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-850 text-center">
                  <div className="text-xl font-black text-rose-500">14</div>
                  <div className="text-[8px] uppercase font-bold text-slate-400 tracking-wide mt-1">Total Orders</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-850 text-center">
                  <div className="text-xl font-black text-amber-500">$380</div>
                  <div className="text-[8px] uppercase font-bold text-slate-400 tracking-wide mt-1">Saved Fees</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start space-x-3">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-amber-600 dark:text-amber-400 leading-normal font-semibold">
                  Your courier priority status currently ranks inside the **Top 5%** of active neighborhoods.
                </div>
              </div>

              <button 
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center space-x-1.5 opacity-80 cursor-not-allowed"
                disabled
              >
                <span>Request Concierge Support</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Cart Drawer Component Integration */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartVersion={cartVersion}
        onCartChange={handleCartChange}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-400 font-semibold transition-colors">
        <span>© 2026 VelocitiBites Premium. Crafted with fine dining aesthetics.</span>
      </footer>

    </div>
  );
}
