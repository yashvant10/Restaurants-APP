import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChefHat, LogOut, Plus, Edit2, Trash2, 
  Search, Image as ImageIcon, X, AlertTriangle, 
  CheckCircle2, Loader2, DollarSign, Tag, AlignLeft, 
  ClipboardList, Check, XCircle, Clock, RefreshCw,
  Bike, ShoppingBag
} from 'lucide-react';
import api from '../api/axios';

export default function RestaurantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active Restaurant state loaded dynamically from backend
  const [restaurant, setRestaurant] = useState(null);
  const [isRestaurantLoading, setIsRestaurantLoading] = useState(true);
  const [restaurantsList, setRestaurantsList] = useState([]);

  // Tabs
  const [activeTab, setActiveTab] = useState('orders'); // 'menu' | 'orders'

  // =====================
  //  MENU STATE
  // =====================
  const [menuItems, setMenuItems] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', image_url: '', category: '', is_veg: true
  });

  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('All');

  // =====================
  //  ORDERS STATE
  // =====================
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  // =====================
  //  DYNAMIC CHIME SYNTHESIS
  // =====================
  const playChimeSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      // High crisp ding (A5 to E6)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); 
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15); 
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.2);

      // Harmonic sparkle (A6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, now + 0.08); 
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.8);
    } catch (err) {
      console.warn("Web Audio API blocked or failed:", err);
    }
  };

  // =====================
  //  FETCHERS
  // =====================
  const fetchRestaurantsList = async () => {
    try {
      const res = await api.get('/api/restaurant/list');
      setRestaurantsList(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to load restaurants list:", err);
      return [];
    }
  };

  const fetchRestaurantProfile = async (targetId = null) => {
    setIsRestaurantLoading(true);
    try {
      let id = targetId;
      
      // Validate targetId
      if (id && (isNaN(parseInt(id)) || String(id) === '[object Object]' || String(id) === 'NaN')) {
        id = null;
      }
      
      // Fallback to localStorage if no valid targetId is provided
      if (!id) {
        const stored = localStorage.getItem('active_restaurant_id');
        if (stored && !isNaN(parseInt(stored)) && String(stored) !== '[object Object]' && String(stored) !== 'NaN') {
          id = parseInt(stored);
        } else {
          localStorage.removeItem('active_restaurant_id');
          id = null;
        }
      }

      const url = id ? `/api/restaurant/me?restaurant_id=${id}` : '/api/restaurant/me';
      const res = await api.get(url);
      setRestaurant(res.data);
      localStorage.setItem('active_restaurant_id', res.data.id);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to sync with gourmet backend server.');
    } finally {
      setIsRestaurantLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    if (!restaurant) return;
    setIsMenuLoading(true);
    try {
      const res = await api.get(`/api/menu-items?restaurant_id=${restaurant.id}`);
      setMenuItems(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch menu items');
    } finally {
      setIsMenuLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!restaurant) return;
    setIsOrdersLoading(true);
    try {
      const res = await api.get(`/api/restaurant/orders?restaurant_id=${restaurant.id}`);
      setPendingOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch orders');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Run initial fetch on mount
  useEffect(() => {
    const initData = async () => {
      await fetchRestaurantsList();
      const storedId = localStorage.getItem('active_restaurant_id');
      let targetId = null;
      if (storedId && !isNaN(parseInt(storedId)) && String(storedId) !== '[object Object]' && String(storedId) !== 'NaN') {
        targetId = parseInt(storedId);
      } else {
        localStorage.removeItem('active_restaurant_id');
      }
      
      // If targetId is null (no stored ID found), fetchRestaurantProfile(null) 
      // will trigger the backend '/api/restaurant/me' route without a query parameter,
      // which automatically retrieves the owner's owned restaurant.
      await fetchRestaurantProfile(targetId);
    };
    initData();
  }, []);

  // Fetch both datasets once restaurant profile is resolved to enable active analytics
  useEffect(() => {
    if (!restaurant) return;
    fetchMenuItems();
    fetchOrders();
  }, [restaurant, activeTab]);

  // WebSocket real-time subscription
  useEffect(() => {
    if (!restaurant) return;

    let ws = null;
    let reconnectTimeout = null;

    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/restaurant_${restaurant.id}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`WebSocket connected to restaurant_${restaurant.id} channel`);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'new_order') {
            setSuccessMsg(`New Order Alert! Order #${payload.order_id} has been placed for $${payload.total_amount.toFixed(2)}!`);
            playChimeSound();
            fetchOrders();
          }
        } catch (err) {
          console.error("Failed to parse websocket message:", err);
        }
      };

      ws.onclose = () => {
        console.log(`WebSocket closed for restaurant_${restaurant.id}. Reconnecting...`);
        reconnectTimeout = setTimeout(connectWS, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [restaurant?.id]);

  useEffect(() => {
    if (successMsg || error) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, error]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // =====================
  //  MENU HANDLERS
  // =====================
  const handleOpenForm = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name, description: item.description, price: item.price,
        image_url: item.image_url, category: item.category, is_veg: item.is_veg
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '', description: '', price: '', image_url: '', category: '', is_veg: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!restaurant) return;
    setIsSubmitting(true);
    const payload = { ...formData, price: parseFloat(formData.price), restaurant_id: restaurant.id };
    try {
      let savedItem;
      if (editingItem) {
        const res = await api.put(`/api/menu-items/${editingItem.id}`, payload);
        savedItem = res.data;
        setMenuItems(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
        setSuccessMsg('Menu item updated successfully!');
      } else {
        const res = await api.post(`/api/menu-items`, payload);
        savedItem = res.data;
        setMenuItems(prev => [...prev, savedItem]);
        setSuccessMsg('New menu item added successfully!');
      }
      handleCloseForm();
    } catch (err) { 
      setError(err.response?.data?.detail || 'Failed to save menu item'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const confirmDelete = (item) => setItemToDelete(item);
  
  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/menu-items/${itemToDelete.id}`);
      setMenuItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      setSuccessMsg('Menu item deleted successfully.');
    } catch (err) { 
      setError(err.response?.data?.detail || 'Failed to delete item'); 
    } finally { 
      setIsDeleting(false); 
      setItemToDelete(null); 
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      const res = await api.patch(`/api/menu-items/${itemId}/toggle-availability`);
      setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, is_available: res.data.is_available } : item));
      setSuccessMsg('Menu item availability updated successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update availability');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedMenuCategory === 'All' || item.category === selectedMenuCategory;
    return matchesSearch && matchesCategory;
  });

  // =====================
  //  ORDER HANDLERS
  // =====================
  const handleUpdateOrderStatus = async (orderId, action) => {
    setProcessingOrderId(orderId);
    try {
      await api.put(`/api/orders/${orderId}/${action}`);
      
      // Determine new status based on action
      let newStatus = 'Pending';
      if (action === 'accept') newStatus = 'Preparing';
      if (action === 'reject') newStatus = 'Rejected';
      if (action === 'deliver') newStatus = 'Delivering';
      if (action === 'complete') newStatus = 'Delivered';

      // Update local state without losing card references
      setPendingOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setSuccessMsg(`Order #${orderId} marked as ${newStatus} successfully.`);
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to update order status.`);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Loading Screen for Restaurant Profile
  if (isRestaurantLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-center transition-colors">
        <div className="space-y-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
          <div className="text-sm font-black text-slate-700 dark:text-slate-200">Connecting to Kitchen Terminals...</div>
        </div>
      </div>
    );
  }

  // Error screen if profile load fails completely
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-center transition-colors">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-10 max-w-md w-full shadow-lg space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto animate-bounce">
            <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-700 dark:text-slate-200">Database Connection Error</div>
            <div className="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">
              We couldn't synchronize your gourmet restaurant terminal with our local server.
            </div>
          </div>
          <button 
            onClick={fetchRestaurantProfile}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // Analytics computations
  const nonRejectedOrders = pendingOrders.filter(o => o.status !== 'Rejected');
  const totalRevenue = nonRejectedOrders.reduce((sum, o) => sum + o.total_amount, 0);
  
  const today = new Date().toDateString();
  const dailySales = nonRejectedOrders
    .filter(o => new Date(o.created_at).toDateString() === today)
    .reduce((sum, o) => sum + o.total_amount, 0);
    
  const totalOrdersCount = nonRejectedOrders.length;
  
  const itemCounts = {};
  nonRejectedOrders.forEach(o => {
    let parsedItems = [];
    try {
      parsedItems = typeof o.items === 'string' 
        ? JSON.parse(o.items) 
        : (Array.isArray(o.items) ? o.items : []);
    } catch (e) {
      console.error("Failed to parse order items", e);
    }
    parsedItems.forEach(item => {
      if (item && item.name) {
        const name = item.name;
        const qty = item.quantity || 1;
        itemCounts[name] = (itemCounts[name] || 0) + qty;
      }
    });
  });
  
  const popularItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  const bestSeller = popularItems[0] || 'N/A';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* 1. Header Navigation */}
      <nav className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 z-20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight leading-tight">{restaurant.name}</div>
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{restaurant.cuisine}</div>
            </div>
          </div>

          {/* Elite Restaurant Selector Dropdown */}
          {restaurantsList.length > 1 && (
            <div className="relative">
              <select
                value={restaurant.id}
                onChange={async (e) => {
                  const targetId = parseInt(e.target.value);
                  setIsRestaurantLoading(true);
                  try {
                    await fetchRestaurantProfile(targetId);
                  } catch (err) {
                    console.error("Error switching restaurant:", err);
                  }
                }}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3.5 py-2 text-xs font-black text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none pr-8 cursor-pointer shadow-sm min-w-[200px]"
              >
                {restaurantsList.map(r => (
                  <option key={r.id} value={r.id} className="font-bold text-slate-800 dark:text-slate-100">
                    🏢 {r.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <RefreshCw className="w-3 h-3 animate-pulse" />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'orders' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Live Orders
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'menu' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Menu Management
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Toast Notifications */}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-2xl flex items-center space-x-3 animate-slide-up">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold">{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-center space-x-3 animate-slide-up">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold">{error}</span>
          </div>
        )}

        {/* Premium Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Today's Sales */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Today's Sales</div>
              <div className="text-xl font-black text-slate-800 dark:text-white">${dailySales.toFixed(2)}</div>
              <div className="text-[9px] text-slate-400 font-bold">Completed & preparing today</div>
            </div>
          </div>

          {/* Card 2: Total Revenue */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Revenue</div>
              <div className="text-xl font-black text-slate-800 dark:text-white">${totalRevenue.toFixed(2)}</div>
              <div className="text-[9px] text-slate-400 font-bold">Lifetime processed revenue</div>
            </div>
          </div>

          {/* Card 3: Total Orders */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Orders</div>
              <div className="text-xl font-black text-slate-800 dark:text-white">{totalOrdersCount}</div>
              <div className="text-[9px] text-slate-400 font-bold">Processed order count</div>
            </div>
          </div>

          {/* Card 4: Popular Menu Item */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <ChefHat className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Top Seller</div>
              <div className="text-sm font-black text-slate-800 dark:text-white truncate" title={bestSeller}>{bestSeller}</div>
              <div className="text-[9px] text-slate-400 font-bold">Most frequent item ordered</div>
            </div>
          </div>
        </div>

        {/* ==============================
            TAB 1: LIVE ORDERS 
        ============================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center space-x-2">
                  <span>Incoming Queue</span>
                  {pendingOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Rejected').length > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                      {pendingOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Rejected').length} Active
                    </span>
                  )}
                </h1>
                <p className="text-xs font-semibold text-slate-500 mt-1">Accept, reject, and route live courier transits securely.</p>
              </div>
              <button 
                onClick={fetchOrders}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isOrdersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Queue</span>
              </button>
            </div>

            {isOrdersLoading ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <div className="text-xs font-bold text-slate-500">Checking terminal...</div>
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                  <ClipboardList className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-700 dark:text-slate-200">No Orders in Queue</div>
                  <div className="text-xs text-slate-400 font-semibold mt-1">Your kitchen preparation queue is currently empty.</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingOrders.map(order => {
                  const isProcessing = processingOrderId === order.id;
                  const orderDate = new Date(order.created_at);
                  const timeStr = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  let parsedItems = [];
                  try {
                    parsedItems = typeof order.items === 'string' 
                      ? JSON.parse(order.items) 
                      : (Array.isArray(order.items) ? order.items : []);
                  } catch (e) {
                    console.error("Failed to parse order items", e);
                  }

                  return (
                    <div 
                      key={order.id} 
                      className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-md flex flex-col transform hover:scale-[1.01] transition-all overflow-hidden ${
                        order.status === 'Pending' ? 'border-orange-500/30 shadow-orange-500/5' :
                        order.status === 'Preparing' ? 'border-amber-500/30 shadow-amber-500/5' :
                        order.status === 'Delivering' ? 'border-rose-500/30 shadow-rose-500/5' :
                        'border-slate-200/50 dark:border-slate-800/50 shadow-sm opacity-80'
                      }`}
                    >
                      {/* Card Header */}
                      <div className={`p-5 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-start ${
                        order.status === 'Pending' ? 'bg-orange-500/5' :
                        order.status === 'Preparing' ? 'bg-amber-500/5' :
                        order.status === 'Delivering' ? 'bg-rose-500/5' :
                        'bg-slate-50/50 dark:bg-slate-950/20'
                      }`}>
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order #{order.id}</div>
                          <div className="text-sm font-bold text-slate-800 dark:text-white">{order.customer_name}</div>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-850 px-2.5 py-1 rounded-full shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{timeStr}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-5 flex-1 space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Order Summary</div>
                        {parsedItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs font-semibold border-b border-dashed border-slate-200/60 dark:border-slate-700/60 pb-2 last:border-0 last:pb-0">
                            <span className="text-slate-700 dark:text-slate-200">
                              <span className="font-black text-amber-500 mr-2">{item.quantity}x</span>
                              {item.name}
                            </span>
                            <span className="text-slate-500">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950 flex flex-col space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-slate-500">Status & Payment</span>
                          <div className="flex items-center space-x-3.5">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              order.status === 'Pending' ? 'bg-orange-500/10 text-orange-600' :
                              order.status === 'Preparing' ? 'bg-amber-500/10 text-amber-600 animate-pulse' :
                              order.status === 'Delivering' ? 'bg-rose-500/10 text-rose-600' :
                              order.status === 'Delivered' ? 'bg-green-500/10 text-green-600' :
                              'bg-slate-500/10 text-slate-500'
                            }`}>
                              {order.status}
                            </span>
                            <span className="text-rose-500 text-base font-black">${order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>

                        {order.status === 'Pending' && (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'reject')}
                              disabled={isProcessing}
                              className="flex items-center justify-center space-x-1.5 py-3 rounded-xl border border-rose-500/50 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'accept')}
                              disabled={isProcessing}
                              className="flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-xs shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              <span>Accept & Prepare</span>
                            </button>
                          </div>
                        )}

                        {order.status === 'Preparing' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'deliver')}
                            disabled={isProcessing}
                            className="w-full flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bike className="w-4 h-4" />}
                            <span>Hand over to Rider (Dispatch)</span>
                          </button>
                        )}

                        {order.status === 'Delivering' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'complete')}
                            disabled={isProcessing}
                            className="w-full flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-xs shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>Mark as Delivered</span>
                          </button>
                        )}

                        {(order.status === 'Delivered' || order.status === 'Rejected') && (
                          <div className="text-center py-2 text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-xl">
                            {order.status === 'Delivered' ? 'Completed & Handed Over' : 'Order Canceled'}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==============================
            TAB 2: MENU MANAGEMENT 
        ============================== */}
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-800 dark:text-white">Menu Catalog</h1>
                <p className="text-xs font-semibold text-slate-500 mt-1">Manage dishes, prices, descriptions, and categories.</p>
              </div>
              <button 
                onClick={() => handleOpenForm()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Item</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input 
                type="text" placeholder="Search menu items by name or category..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-semibold w-full px-3 py-1 text-slate-700 dark:text-slate-200 placeholder-slate-400"
              />
            </div>

            {/* Category selection pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['All', ...new Set(menuItems.map(item => item.category))].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedMenuCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedMenuCategory === cat
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
              {isMenuLoading ? (
                <div className="p-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <div className="text-xs font-bold text-slate-500">Loading Menu Catalog...</div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                    <ChefHat className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-700 dark:text-slate-200">No Items Found</div>
                    <div className="text-xs text-slate-400 font-semibold mt-1">Try adjusting your search or add a new menu item.</div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200/50 dark:border-slate-800/50">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 w-16">Image</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Dish Detail</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Category</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Price</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Availability</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="px-6 py-4">
                            <img 
                              src={item.image_url} alt={item.name} 
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200/50 dark:border-slate-700 shadow-sm"
                              onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60"; }}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-sm text-slate-800 dark:text-slate-150">{item.name}</div>
                            <div className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate max-w-xs">{item.description}</div>
                            <div className="mt-1">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${item.is_veg ? 'bg-green-500/10 text-green-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                {item.is_veg ? 'Vegetarian' : 'Non-Veg'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{item.category}</span>
                          </td>
                          <td className="px-6 py-4 font-black text-slate-800 dark:text-white">${item.price.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <button 
                              type="button"
                              onClick={() => handleToggleAvailability(item.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                item.is_available ?? true ? 'bg-green-500' : 'bg-slate-350 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  item.is_available ?? true ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button onClick={() => handleOpenForm(item)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => confirmDelete(item)} className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={handleCloseForm} />
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl relative z-10 shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 rounded-t-3xl">
              <h2 className="text-lg font-black text-slate-800 dark:text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button onClick={handleCloseForm} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
              <div className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Dish Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag className="w-4 h-4 text-slate-400" /></div>
                    <input 
                      required type="text" name="name"
                      value={formData.name} onChange={handleFormChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-slate-800 dark:text-white"
                      placeholder="e.g. Classic Truffle Burger"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Price ($) *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><DollarSign className="w-4 h-4 text-slate-400" /></div>
                      <input 
                        required type="number" step="0.01" min="0" name="price"
                        value={formData.price} onChange={handleFormChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-slate-800 dark:text-white"
                        placeholder="14.99"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Category *</label>
                    <input 
                      required type="text" name="category"
                      value={formData.category} onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-slate-800 dark:text-white"
                      placeholder="e.g. Mains, Starters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Description *</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none"><AlignLeft className="w-4 h-4 text-slate-400" /></div>
                    <textarea 
                      required name="description" rows="3"
                      value={formData.description} onChange={handleFormChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-slate-800 dark:text-white resize-none"
                      placeholder="Describe the dish ingredients and preparation..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Image URL *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ImageIcon className="w-4 h-4 text-slate-400" /></div>
                    <input 
                      required type="url" name="image_url"
                      value={formData.image_url} onChange={handleFormChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-slate-800 dark:text-white"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <input 
                    type="checkbox" name="is_veg" id="is_veg"
                    checked={formData.is_veg} onChange={handleFormChange}
                    className="w-4 h-4 text-green-500 bg-slate-100 border-slate-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="is_veg" className="text-xs font-bold text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                    This is a Vegetarian dish
                  </label>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-end space-x-3">
                <button 
                  type="button" onClick={handleCloseForm}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Publish Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm animate-fade-in" onClick={() => setItemToDelete(null)} />
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm relative z-10 shadow-2xl animate-scale-up p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-inner border border-rose-500/10">
              <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Delete Item?</h2>
              <p className="text-xs text-slate-500 font-semibold px-2">
                Are you sure you want to permanently remove <strong className="text-slate-800 dark:text-slate-200">{itemToDelete.name}</strong> from your menu? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button 
                onClick={() => setItemToDelete(null)} disabled={isDeleting}
                className="w-1/2 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete} disabled={isDeleting}
                className="w-1/2 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
