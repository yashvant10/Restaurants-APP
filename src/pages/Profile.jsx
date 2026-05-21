import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Lock, Shield, MapPin, ShoppingBag, 
  Trash2, Plus, ArrowLeft, LogOut, ChevronRight, 
  Check, Edit2, Compass, Award, Smartphone, Eye, EyeOff
} from 'lucide-react';
import authService from '../services/authService';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

const AVATARS = [
  '🧑‍🍳', '🍳', '🍕', '🍣', '🍔', '🥗', '🍩', '🥑', '🍷', '🍜', '🍦', '🍰'
];

export default function Profile() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // Profile fields state
  const [fullName, setFullName] = useState(user?.fullName || user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '🧑‍🍳');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password fields state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Address directory state
  const [addresses, setAddresses] = useState(() => {
    try {
      return user?.addresses || JSON.parse(localStorage.getItem('velocitibites_addresses')) || [];
    } catch {
      return [];
    }
  });
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressStreet, setNewAddressStreet] = useState('');
  const [newAddressCity, setNewAddressCity] = useState('');
  const [newAddressZip, setNewAddressZip] = useState('');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [activeAddressIndex, setActiveAddressIndex] = useState(() => {
    return parseInt(localStorage.getItem('velocitibites_active_address_idx') || '0', 10);
  });

  // Orders log state
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  // Sync theme
  const [theme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  // Fetch Order History
  useEffect(() => {
    const fetchHistory = async () => {
      setIsOrdersLoading(true);
      try {
        const history = await orderService.getMyOrders();
        setOrders(history);
      } catch (err) {
        console.error('Failed to load orders history:', err);
      } finally {
        setIsOrdersLoading(false);
      }
    };
    if (token) {
      fetchHistory();
    }
  }, [token]);

  // Update Profile details handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Name and Email fields are required');
      return;
    }
    setIsSavingProfile(true);
    try {
      const updatedUser = await authService.updateProfile(fullName, email, avatar, addresses);
      
      // Update session localStorage
      const sessionUser = JSON.parse(localStorage.getItem('velocitibites_user') || '{}');
      const nextUser = { 
        ...sessionUser, 
        fullName: updatedUser.full_name,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        addresses: updatedUser.addresses
      };
      localStorage.setItem('velocitibites_user', JSON.stringify(nextUser));
      
      toast.success('Gourmet Profile details updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update profile settings';
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    setIsChangingPass(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast.success('Your credentials have been securely updated!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to securely alter credentials';
      toast.error(msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  // Add saved address handler
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddressLabel || !newAddressStreet || !newAddressCity || !newAddressZip) {
      toast.error('All address fields are required');
      return;
    }
    const targetAddress = {
      label: newAddressLabel,
      street: newAddressStreet,
      city: newAddressCity,
      zip: newAddressZip
    };
    const nextAddresses = [...addresses, targetAddress];
    setAddresses(nextAddresses);
    localStorage.setItem('velocitibites_addresses', JSON.stringify(nextAddresses));

    // Persist to backend database for logged-in consistency
    try {
      await authService.updateProfile(fullName, email, avatar, nextAddresses);
    } catch (err) {
      console.error('Failed to sync address to backend:', err);
    }

    setNewAddressLabel('');
    setNewAddressStreet('');
    setNewAddressCity('');
    setNewAddressZip('');
    setShowAddAddressModal(false);
    toast.success('Address added to your Gourmet Book!');
  };

  // Remove saved address
  const handleRemoveAddress = async (idxToDelete) => {
    const nextAddresses = addresses.filter((_, idx) => idx !== idxToDelete);
    setAddresses(nextAddresses);
    localStorage.setItem('velocitibites_addresses', JSON.stringify(nextAddresses));

    if (activeAddressIndex === idxToDelete) {
      setActiveAddressIndex(0);
      localStorage.setItem('velocitibites_active_address_idx', '0');
    }

    try {
      await authService.updateProfile(fullName, email, avatar, nextAddresses);
    } catch (err) {
      console.error('Failed to sync address deletion to database:', err);
    }
    toast.success('Address removed');
  };

  const handleSetActiveAddress = (idx) => {
    setActiveAddressIndex(idx);
    localStorage.setItem('velocitibites_active_address_idx', idx.toString());
    toast.success(`Active delivery destination set to: ${addresses[idx]?.label}`);
  };

  // Terminate device sessions
  const handleTerminateSessions = async () => {
    try {
      await authService.logoutAllDevices();
      toast.success('Logged out from all other device connections!');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1000);
    } catch (err) {
      toast.error('Failed to clear device sessions');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sticky Header Nav */}
      <nav className="sticky top-0 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/60 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link 
            to="/customer-dashboard" 
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-rose-500 transition-all active:scale-90"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase text-slate-400">Gourmet Account</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage Settings & Addresses</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full border border-rose-500/10 shadow-xs">
            VIP customer
          </span>
        </div>
      </nav>

      {/* Main Grid */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar choice & fast profile info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Glass Card Avatar picker */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-xs text-center space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-500/5 rounded-full blur-lg pointer-events-none" />
            
            <div className="relative">
              <span className="inline-block text-6xl p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-full shadow-inner select-none">
                {avatar}
              </span>
              <div className="absolute bottom-1 right-1/3 p-1.5 bg-rose-500 text-white rounded-full border border-white dark:border-slate-900">
                <Edit2 className="w-3 h-3 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight">{fullName || 'Gourmet Patron'}</h2>
              <p className="text-xs text-slate-400 font-semibold">{email || 'customer@velocitibites.com'}</p>
            </div>

            {/* Avatar picker catalog */}
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Choose Culinary Emoji</span>
              <div className="grid grid-cols-6 gap-2 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200/30 dark:border-slate-800/50">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setAvatar(emoji)}
                    className={`text-xl p-1.5 rounded-lg transition-all active:scale-90 hover:bg-white dark:hover:bg-slate-800 border ${
                      avatar === emoji 
                        ? 'bg-white dark:bg-slate-800 border-rose-500 shadow-xs' 
                        : 'border-transparent'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Status Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-left">
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850">
                <div className="text-xs font-black text-rose-500 flex items-center space-x-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{orders.length}</span>
                </div>
                <div className="text-[9px] uppercase font-bold text-slate-400 mt-1">Gourmet Orders</div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850">
                <div className="text-xs font-black text-amber-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{addresses.length}</span>
                </div>
                <div className="text-[9px] uppercase font-bold text-slate-400 mt-1">Saved Destinations</div>
              </div>
            </div>

          </div>

          {/* Security Device sessions */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-xs text-left space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span>Registered Devices</span>
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal font-semibold">
              Currently logged into multiple client terminals. You can invalidate token access states across all terminals by clicking below.
            </p>
            <button
              onClick={handleTerminateSessions}
              className="w-full flex items-center justify-center space-x-1.5 px-4 py-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout from All Devices</span>
            </button>
          </div>

        </div>

        {/* Center & Right Column: Settings Form, Address directory, and orders timeline */}
        <div className="lg:col-span-2 space-y-6 text-left">
          
          {/* Tabs / Card Profile Details Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-xs space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile Settings</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 border border-slate-200/60 dark:border-slate-800/80">
                    <User className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-transparent text-xs w-full py-3 outline-none font-semibold text-slate-700 dark:text-slate-100 placeholder-slate-400"
                      placeholder="David Wheeler"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 border border-slate-200/60 dark:border-slate-800/80">
                    <Mail className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent text-xs w-full py-3 outline-none font-semibold text-slate-700 dark:text-slate-100 placeholder-slate-400"
                      placeholder="david.w@gourmet.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Secure credentials alteration */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-xs space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Password</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 border border-slate-200/60 dark:border-slate-800/80">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <input 
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-transparent text-xs w-full py-3 outline-none font-semibold text-slate-700 dark:text-slate-100"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowOld(!showOld)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showOld ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">New Password</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 border border-slate-200/60 dark:border-slate-800/80">
                    <Lock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                    <input 
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-transparent text-xs w-full py-3 outline-none font-semibold text-slate-700 dark:text-slate-100"
                      placeholder="Min 8 characters"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNew(!showNew)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Confirm New Password</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 border border-slate-200/60 dark:border-slate-800/80">
                    <Lock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-transparent text-xs w-full py-3 outline-none font-semibold text-slate-700 dark:text-slate-100"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-800 dark:border-slate-700 text-xs font-black uppercase tracking-wider shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isChangingPass ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Saved Destinations address manager */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Saved Delivery Destinations</span>
              </h3>
              
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Destination</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 p-6">
                <MapPin className="w-8 h-8 text-slate-350 dark:text-slate-650 mx-auto stroke-[1.5]" />
                <div className="text-xs font-bold text-slate-500 mt-2">No Destinations Saved Yet</div>
                <p className="text-[10px] text-slate-400 mt-1">Add home, work, or temporary addresses to check out instantly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border transition-all text-left ${
                      activeAddressIndex === idx 
                        ? 'border-rose-500 ring-1 ring-rose-500/10' 
                        : 'border-slate-200/40 dark:border-slate-800/40'
                    }`}
                  >
                    <div 
                      onClick={() => handleSetActiveAddress(idx)}
                      className="flex-1 flex items-start space-x-3.5 cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        activeAddressIndex === idx 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {addr.label.toLowerCase().includes('home') ? '🏠' : addr.label.toLowerCase().includes('office') || addr.label.toLowerCase().includes('work') ? '💼' : '📍'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs">{addr.label}</span>
                          {activeAddressIndex === idx && (
                            <span className="text-[8px] font-black uppercase bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded-md">
                              Active Destination
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                          {addr.street}, {addr.city} • {addr.zip}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveAddress(idx)}
                      className="p-2 rounded-xl hover:bg-rose-500/15 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
                      title="Delete Destination"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Purchases Order Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-xs space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-slate-400" />
              <span>Gourmet Order History</span>
            </h3>

            {isOrdersLoading ? (
              <div className="space-y-3.5">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 p-6">
                <ShoppingBag className="w-8 h-8 text-slate-350 dark:text-slate-650 mx-auto stroke-[1.5]" />
                <div className="text-xs font-bold text-slate-500 mt-2">No Order History Found</div>
                <p className="text-[10px] text-slate-400 mt-1">Make your first premium food discovery today!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:border-amber-500/20 transition-all"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{ord.restaurant_name}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">#VB-{ord.id}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1 font-semibold leading-relaxed">
                          {ord.items && ord.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}
                        </div>
                        <div className="text-[9px] text-rose-500 font-extrabold mt-1.5">
                          Paid: ${ord.total_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-250/20">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        ord.status.toLowerCase() === 'delivered' 
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400' 
                          : ord.status.toLowerCase() === 'rejected'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 animate-pulse'
                      }`}>
                        {ord.status}
                      </span>
                      <Link
                        to={`/order-tracker/${ord.id}`}
                        className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-600 flex items-center mt-2 group"
                      >
                        <span>Live Track</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Add Address Glass Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-xl max-w-md w-full text-left space-y-5 animate-scaleUp">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Add Saved Destination</h4>
              <p className="text-[10px] text-slate-450 mt-0.5">Specify locations for express delivery couriers.</p>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Destination Label</label>
                <input 
                  type="text" 
                  value={newAddressLabel}
                  onChange={(e) => setNewAddressLabel(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 text-xs w-full py-3 px-3 rounded-xl outline-none font-semibold border border-slate-200/60 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  placeholder="e.g. Home, Office, Gym, Sarah's House"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Street Address</label>
                <input 
                  type="text" 
                  value={newAddressStreet}
                  onChange={(e) => setNewAddressStreet(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 text-xs w-full py-3 px-3 rounded-xl outline-none font-semibold border border-slate-200/60 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  placeholder="128 Gourmet Avenue, Apt 4C"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">City</label>
                  <input 
                    type="text" 
                    value={newAddressCity}
                    onChange={(e) => setNewAddressCity(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 text-xs w-full py-3 px-3 rounded-xl outline-none font-semibold border border-slate-200/60 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    placeholder="New York"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Postal ZIP Code</label>
                  <input 
                    type="text" 
                    value={newAddressZip}
                    onChange={(e) => setNewAddressZip(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 text-xs w-full py-3 px-3 rounded-xl outline-none font-semibold border border-slate-200/60 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/85 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-rose-600 transition-all cursor-pointer active:scale-95"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
