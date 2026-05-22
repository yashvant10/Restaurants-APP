import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, MapPin, Bike, CheckCircle2, ShieldCheck, 
  Loader2, ShoppingBag, Phone, AlertCircle, Sparkles, Navigation,
  Activity, Star, ChefHat, Send, MessageSquare, ChevronDown, Check
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

// Visual Tracking Steps Definition
const TRACKING_STEPS = [
  { id: 'placed', label: 'Order Placed', desc: 'Received & validated by restaurant', icon: ShoppingBag, color: 'from-amber-400 to-amber-600' },
  { id: 'preparing', label: 'Preparing', desc: 'Kitchen preparing your gourmet meal', icon: ChefHat, color: 'from-orange-400 to-orange-600' },
  { id: 'delivering', label: 'Out for Delivery', desc: 'Courier carrying premium cargo', icon: Bike, color: 'from-rose-400 to-rose-600' },
  { id: 'delivered', label: 'Delivered', desc: 'Gourmet meal arrived safely', icon: CheckCircle2, color: 'from-green-400 to-green-600' }
];

export default function OrderTracker() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // API States
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulation State for Rider Map Location
  const [riderCoords, setRiderCoords] = useState({ x: 25, y: 25 });
  const [radarPulse, setRadarPulse] = useState(true);

  // Chat Panel State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isRiderTyping, setIsRiderTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'rider',
      text: 'Hi! I am securing your hot food pack in my thermal cargo container now. Do you have any gate codes or drop-off details?',
      time: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Ref to track previous status for sound triggers
  const prevStatusRef = useRef('');
  const chatBottomRef = useRef(null);

  // Dynamic status mapping helper
  const getStepIndex = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s === 'pending' || s === 'placed') return 0;
    if (s === 'preparing' || s === 'accepted' || s === 'cooking') return 1;
    if (s === 'delivering' || s === 'dispatched' || s === 'out for delivery') return 2;
    if (s === 'delivered') return 3;
    return 0; // default
  };

  // Web Audio API Synthesizer (ascending luxury chime chord)
  const playChimeSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playNote = (freq, time, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.18, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + duration);
      };

      const now = ctx.currentTime;
      // Synthesize elegant 4-note ascending SaaS chime chord
      playNote(523.25, now, 0.5);        // C5
      playNote(659.25, now + 0.12, 0.5); // E5
      playNote(783.99, now + 0.24, 0.6); // G5
      playNote(1046.50, now + 0.36, 0.8); // C6
    } catch (err) {
      console.warn("Web Audio chime synthesis blocked by client security context:", err);
    }
  };

  // Poll Backend for live order updates as standard backup
  const fetchOrderDetails = async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to sync with kitchen server.';
      setError(msg);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  // Hook up WebSockets Connection
  useEffect(() => {
    if (!orderId) return;

    const wsUrl = `ws://localhost:8000/ws/order_${orderId}`;
    let ws = null;
    let reconnectTimeout = null;

    const connectWs = () => {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // If broadcast contains order updates, apply instantly
          if (msg.status) {
            setOrder(prev => {
              if (!prev) return null;
              return {
                ...prev,
                status: msg.status,
                estimated_time: msg.estimated_time || prev.estimated_time
              };
            });
            toast.success(`Order status updated to: ${msg.status.toUpperCase()}`);
          }
        } catch (err) {
          console.error("Failed to parse websocket payload:", err);
        }
      };

      ws.onclose = () => {
        // Attempt automatic reconnection every 5 seconds if disconnected
        reconnectTimeout = setTimeout(connectWs, 5000);
      };
    };

    connectWs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [orderId]);

  // Run initial fetch and configure backup auto polling
  useEffect(() => {
    fetchOrderDetails(true);
    const interval = setInterval(() => {
      fetchOrderDetails(false);
    }, 6000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Listen to status changes to synthesize premium chime
  useEffect(() => {
    if (order && order.status) {
      if (prevStatusRef.current && prevStatusRef.current !== order.status) {
        playChimeSound();
      }
      prevStatusRef.current = order.status;
    }
  }, [order?.status]);

  // Auto-scroll chat window
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isRiderTyping]);

  // Simulate rider coordinates smoothly moving along a Quadratic Bezier Curve
  // P0 (Kitchen) = {25, 25}, P1 (Control point) = {50, 15}, P2 (Destination) = {75, 75}
  useEffect(() => {
    if (!order) return;
    const stepIdx = getStepIndex(order.status);
    
    if (stepIdx === 1) {
      // Preparing: fidgeting in kitchen
      const interval = setInterval(() => {
        setRiderCoords({
          x: 25 + (Math.random() - 0.5) * 1.5,
          y: 25 + (Math.random() - 0.5) * 1.5
        });
      }, 2000);
      return () => clearInterval(interval);
    } else if (stepIdx === 2) {
      // Delivers: Rider travels smoothly on curve
      let t = 0;
      const interval = setInterval(() => {
        t += 0.015;
        if (t > 1) t = 0; // loop coordinates for premium radar simulation
        
        // Quadratic Bezier Formula:
        // x = (1-t)^2 * P0.x + 2(1-t)t * P1.x + t^2 * P2.x
        const currentX = (1 - t) * (1 - t) * 25 + 2 * (1 - t) * t * 50 + t * t * 75;
        const currentY = (1 - t) * (1 - t) * 25 + 2 * (1 - t) * t * 15 + t * t * 75;
        
        setRiderCoords({ x: currentX, y: currentY });
      }, 250);
      return () => clearInterval(interval);
    } else if (stepIdx === 3) {
      // Delivered
      setRiderCoords({ x: 75, y: 75 });
    } else {
      // Placed
      setRiderCoords({ x: 25, y: 25 });
    }
  }, [order?.status]);

  // Radar Pulse Animation Trigger
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setRadarPulse(prev => !prev);
    }, 1550);
    return () => clearInterval(pulseInterval);
  }, []);

  // Send Driver message handler with smart automated replies
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = {
      sender: 'user',
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    const userText = chatMessage.toLowerCase();
    setChatMessage('');

    // Trigger Typing simulator
    setIsRiderTyping(true);

    setTimeout(() => {
      let replyText = "Understood! I'll update my coordinates accordingly. On my way!";
      if (userText.includes('gate') || userText.includes('code') || userText.includes('building')) {
        replyText = "Got it! Thanks for the drop-off coordinates, I will leave it right at the door.";
      } else if (userText.includes('thank') || userText.includes('thanks') || userText.includes('ty')) {
        replyText = "You are so welcome! Enjoy your hot VelocitiBites meal!";
      } else if (userText.includes('hot') || userText.includes('warm')) {
        replyText = "Yes, it is tightly secured in my thermal induction pack, it will arrive steaming hot!";
      } else if (userText.includes('where') || userText.includes('time') || userText.includes('delay')) {
        replyText = "Passing the primary traffic circle now. I am roughly 4 minutes out!";
      }

      const riderReply = {
        sender: 'rider',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, riderReply]);
      setIsRiderTyping(false);
    }, 1800);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#090A0F] flex flex-col justify-center items-center p-6 text-center transition-colors">
        <div className="space-y-4">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
          <div className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest animate-pulse">Syncing logistics channel...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#090A0F] flex flex-col justify-center items-center p-6 text-center transition-colors">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-10 max-w-md w-full shadow-lg space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-700 dark:text-slate-200">Logistics Offline</div>
            <div className="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">
              {error || "Order tracking details are currently unavailable."}
            </div>
          </div>
          <button 
            onClick={() => navigate('/customer-dashboard')}
            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-black text-xs transition-all shadow-md cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activeStepIdx = getStepIndex(order.status);
  const currentStep = TRACKING_STEPS[activeStepIdx];

  // Helper for progress line width percentage
  const progressPercent = (activeStepIdx / (TRACKING_STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300 relative">
      
      {/* Dynamic Gourmet Ambient Glow Blobs */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-200px] left-[5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-amber-500/5 to-rose-500/5 blur-[120px]"></div>
        <div className="absolute top-[100px] right-[5%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-rose-500/5 to-orange-500/5 blur-[120px]"></div>
      </div>

      {/* 1. Header Navigation Bar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-20 transition-colors">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            to="/customer-dashboard"
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="inline-flex items-center space-x-2 bg-rose-500/10 text-rose-600 dark:text-rose-450 px-3.5 py-1.5 rounded-full font-black text-[9px] uppercase tracking-wider border border-rose-500/20">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Live Dispatch System</span>
          </div>
          <div className="w-20"></div> {/* Spacer for symmetry */}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        
        {/* 2. Main Tracking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Step Tracker & Items (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Box A: Status Overview Card */}
            <div className="bg-white dark:bg-[#12141D] rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                <div className="text-left space-y-1.5">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Order Reference ID #{order.id}</div>
                  <h2 className="text-xl font-black tracking-tight text-slate-850 dark:text-white">{order.restaurant_name}</h2>
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-semibold text-xs mt-1">
                    <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span>Estimated Delivery Window: </span>
                    <strong className="text-rose-500 font-black">{order.estimated_time}</strong>
                  </div>
                </div>
                
                {/* Active Status Badge */}
                <div className="flex items-center space-x-2 bg-rose-500/10 dark:bg-rose-500/5 px-4 py-2.5 rounded-2xl border border-rose-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">{order.status}</span>
                </div>
              </div>

              {/* Progress Stepper Component */}
              <div className="pt-8 px-2">
                <div className="relative flex items-center justify-between w-full">
                  {/* Background line */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0 transition-colors"></div>
                  {/* Colored active line */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full z-0 transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>

                  {/* Individual Step Circles */}
                  {TRACKING_STEPS.map((step, idx) => {
                    const isCompleted = idx < activeStepIdx;
                    const isActive = idx === activeStepIdx;
                    const StepIcon = step.icon;
                    
                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white scale-100' 
                            : isActive 
                            ? 'bg-rose-500 text-white scale-110 ring-4 ring-rose-500/20 shadow-lg shadow-rose-500/30' 
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-800 scale-90'
                        }`}>
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <div className="mt-3 text-center max-w-[85px] hidden md:block">
                          <div className={`text-[9px] font-black uppercase tracking-wider leading-tight ${
                            isActive ? 'text-rose-500' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
                          }`}>
                            {step.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Step labels for mobile screens */}
                <div className="mt-6 md:hidden bg-slate-50 dark:bg-slate-900/60 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-start space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                    {React.createElement(currentStep.icon, { className: "w-5 h-5" })}
                  </div>
                  <div className="text-left space-y-1">
                    <div className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">{currentStep.label}</div>
                    <div className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold">{currentStep.desc}</div>
                  </div>
                </div>

                {/* Subtext active step description (Desktop) */}
                <div className="hidden md:block bg-slate-50 dark:bg-slate-900/60 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-850 text-left mt-8">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Logistics Dispatch Log:</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1.5 pl-6">
                    {currentStep.desc}
                  </p>
                </div>

              </div>
            </div>

            {/* Box B: Order Items Summary Breakdown */}
            <div className="bg-white dark:bg-[#12141D] rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left transition-colors">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-rose-500" />
                <span>Cargo Manifest Summary</span>
              </h3>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3.5 text-xs font-semibold">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} 
                        alt={item.name} 
                        className="w-10 h-10 object-cover rounded-xl shadow-sm border border-slate-100 dark:border-slate-800"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100";
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-slate-700 dark:text-slate-300 font-bold">{item.name}</span>
                        <span className="text-[10px] text-slate-450 font-semibold">{item.quantity} x ${parseFloat(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-extrabold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-xs mt-3 font-bold">
                <span className="text-slate-450 dark:text-slate-400">Total Charged (VAT & Delivery Surcharges Included)</span>
                <span className="font-black text-rose-500 text-lg tracking-tight">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>

          </div>

          {/* Right Side: Map Simulation & Driver Chat (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Simulated Radar Tracking Map */}
            <div className="bg-white dark:bg-[#12141D] rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-left relative overflow-hidden transition-colors">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-1 flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Live Curved Path Radar</span>
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mb-4">
                Dynamic Quadratic Bezier logistics transit simulation.
              </p>

              {/* Grid Simulator Canvas */}
              <div className="relative w-full aspect-square rounded-2xl bg-[#090A0F] border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
                
                {/* Radar Grid Meshes */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none z-0"></div>

                {/* Glowing Radar pulse rings */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-[85%] h-[85%] rounded-full border border-rose-500 animate-ping [animation-duration:4s]"></div>
                  <div className="w-[50%] h-[50%] rounded-full border border-rose-500"></div>
                </div>

                {/* Curved Bezier route simulation path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gourmetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                  
                  {/* Total Path Dotted */}
                  <path 
                    d="M 25,25 Q 50,15 75,75" 
                    fill="none" 
                    stroke="rgba(244, 63, 94, 0.15)" 
                    strokeWidth="2.5" 
                    strokeDasharray="4,3"
                  />
                  
                  {/* Solid Active Progress Path */}
                  <path 
                    d="M 25,25 Q 50,15 75,75" 
                    fill="none" 
                    stroke="url(#gourmetGradient)" 
                    strokeWidth="2.5" 
                    strokeDasharray="140" 
                    strokeDashoffset={140 - 140 * (progressPercent / 100)} 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* A. Restaurant Node (Kitchen) */}
                <div 
                  className="absolute p-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-500 z-10 flex items-center justify-center shadow-lg"
                  style={{ left: '25%', top: '25%', transform: 'translate(-50%, -50%)' }}
                >
                  <ChefHat className="w-4 h-4" />
                  <span className="absolute -bottom-4.5 text-[7px] font-black uppercase text-slate-400 whitespace-nowrap bg-black/60 px-1 py-0.5 rounded border border-white/5">Kitchen</span>
                </div>

                {/* B. Customer Node (Home) */}
                <div 
                  className="absolute p-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-500 z-10 flex items-center justify-center shadow-lg"
                  style={{ left: '75%', top: '75%', transform: 'translate(-50%, -50%)' }}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="absolute -bottom-4.5 text-[7px] font-black uppercase text-slate-400 whitespace-nowrap bg-black/60 px-1 py-0.5 rounded border border-white/5">Your Home</span>
                </div>

                {/* C. ACTIVE RIDER NODE */}
                {activeStepIdx > 0 && activeStepIdx < 3 && (
                  <div 
                    className="absolute p-2.5 rounded-full bg-rose-500 text-white z-20 shadow-lg shadow-rose-500/40 flex items-center justify-center transition-all duration-300 ease-out"
                    style={{ left: `${riderCoords.x}%`, top: `${riderCoords.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <Bike className="w-3.5 h-3.5 animate-bounce" />
                    
                    {/* Radar Pulse Effect surrounding Rider */}
                    <span className={`absolute -inset-2.5 rounded-full bg-rose-500/25 border border-rose-500/20 z-0 transition-all duration-1000 ${
                      radarPulse ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
                    }`}></span>
                  </div>
                )}
              </div>

              {/* Courier Profile Detail */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center space-x-3.5 text-xs">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-rose-500/10">
                    👨‍✈️
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-slate-800 dark:text-white">Marcus Vance</div>
                    <div className="text-[9px] uppercase text-rose-500 font-extrabold tracking-wider flex items-center gap-1.5">
                      <span>Premium Courier</span>
                      <span className="flex items-center text-amber-500">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> 4.9
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Chat Toggle Button */}
                  <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer relative ${
                      isChatOpen ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600' : 'text-slate-500 dark:text-slate-400'
                    }`}
                    title="Toggle Message Center"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {!isChatOpen && (
                      <span className="absolute top-[-3px] right-[-3px] w-2.5 h-2.5 rounded-full bg-rose-500 border border-white dark:border-slate-900 animate-ping"></span>
                    )}
                  </button>

                  {/* VOIP Call Button */}
                  <button 
                    onClick={() => toast.success("Connecting securely via Velociti VOIP portal...")}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                    title="Contact Courier"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DYNAMIC DRIVER CHAT CONTAINER (Drawer slide-down style) */}
              {isChatOpen && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 animate-[fadeIn_0.3s_ease] text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Channel</span>
                    <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-slate-650 text-xs">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Chat Box */}
                  <div className="h-44 bg-slate-50 dark:bg-[#090A0F] border border-slate-200/50 dark:border-slate-850 rounded-2xl p-3 overflow-y-auto space-y-2.5">
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-[11px] font-medium leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-rose-500 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-150 dark:border-slate-800/80 rounded-tl-none shadow-xs'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1 px-1">{msg.time}</span>
                      </div>
                    ))}
                    
                    {/* Typing indicator */}
                    {isRiderTyping && (
                      <div className="flex items-center space-x-2 text-slate-400 text-[10px] font-bold pl-1 animate-pulse">
                        <span>Marcus is typing</span>
                        <span className="flex space-x-0.5">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                        </span>
                      </div>
                    )}

                    <div ref={chatBottomRef} />
                  </div>

                  {/* Send Input Form */}
                  <form onSubmit={handleSendMessage} className="mt-3 flex items-center space-x-2">
                    <input 
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type message for courier..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 px-4 py-2.5 rounded-xl text-xs font-semibold placeholder-slate-400 outline-none focus:border-rose-500/20 text-slate-800 dark:text-slate-100"
                    />
                    <button 
                      type="submit"
                      className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md shadow-rose-500/10 cursor-pointer active:scale-95 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

            </div>

            {/* Courier Safety Shield */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 flex items-start space-x-3.5 text-left transition-colors">
              <ShieldCheck className="w-5.5 h-5.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">VelocitiBites Security Seal</h4>
                <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                  This transaction and delivery process are fully encrypted. All logistics are secured with double-insulated temperature shield seals.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

