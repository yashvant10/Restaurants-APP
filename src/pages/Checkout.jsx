import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, CreditCard, Check, 
  MapPin, Clock, AlertTriangle, ShieldCheck
} from 'lucide-react';
import api from '../api/axios';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurant } = location.state || {};

  const [cart, setCart] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successOrderId, setSuccessOrderId] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('velocitibites_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRestaurantId(parsed.restaurantId);
        setCart(parsed.items || {});
      }
    } catch (e) {
      console.error('Error parsing cart:', e);
    }
  }, []);

  if (!cart || Object.keys(cart).length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-10 max-w-md w-full shadow-lg space-y-5">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-700 dark:text-slate-200">Your Basket is Empty</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Add culinary masterpieces to check out.</div>
          </div>
          <button 
            onClick={() => navigate('/customer-dashboard')}
            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-black text-xs transition-all shadow-md"
          >
            Explore Restaurants
          </button>
        </div>
      </div>
    );
  }

  const cartItemsArray = Object.values(cart);
  const cartTotalQuantity = cartItemsArray.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItemsArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const priorityShippingFee = 2.50;
  const serviceTax = 1.80;
  const isFreeDelivery = cartSubtotal >= 35.00;
  const deliveryFee = isFreeDelivery ? 0 : 4.99;
  const cartTotalSum = cartSubtotal + priorityShippingFee + serviceTax + deliveryFee;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const payload = {
        user_id: 1, // Securely mapped from token on the backend!
        restaurant_id: parseInt(restaurantId),
        items: cartItemsArray.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image_url: item.image_url || item.image || ''
        })),
        total_amount: cartTotalSum
      };

      const response = await api.post('/api/orders/', payload);

      // Clear Cart
      localStorage.removeItem('velocitibites_cart');
      
      // Show Success Modal
      setSuccessOrderId(response.data.order_id);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.detail || err.message || 'Failed to submit order. Please try again.';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // SUCCESS STATE
  if (successOrderId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white dark:bg-slate-900 border border-green-500/20 rounded-3xl p-10 max-w-md w-full shadow-2xl animate-scale-up space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto shadow-inner border border-green-500/20">
            <Check className="w-10 h-10 stroke-[3] animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Order Confirmed!</h2>
            <div className="inline-flex items-center space-x-1.5 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
              <span>Order #{successOrderId}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold px-4 pt-2">
              Your payment was successful and your order has been sent to the kitchen.
              Prepare your taste buds!
            </p>
          </div>

          <div className="space-y-3 mt-6">
            <button 
              onClick={() => navigate(`/order-tracker/${successOrderId}`)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs transition-all shadow-md hover:shadow-rose-500/10 hover:scale-[1.01]"
            >
              Track Order Live 🚀
            </button>
            <button 
              onClick={() => navigate('/customer-dashboard')}
              className="w-full py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-950 font-bold text-xs transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>
          <div className="text-sm font-black tracking-tight">Secure Checkout</div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Order Items & Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Info */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Delivery Details</h3>
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-amber-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white">Home</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    123 Gourmet Avenue, Food District, FL 33012
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-rose-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white">Delivery Time</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {restaurant ? restaurant.deliveryTime : '25-35 Mins'} (Standard Delivery)
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Order Summary</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cartTotalQuantity} Items</span>
              </div>
              
              <div className="space-y-4">
                {cartItemsArray.map(item => (
                  <div key={item.id} className="flex items-start space-x-4 border-b border-slate-100 dark:border-slate-800/50 pb-4 last:border-0 last:pb-0">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl shadow-sm" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{item.name}</div>
                        <div className="text-xs font-black text-slate-800 dark:text-white">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - Billing Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-xl sticky top-24 space-y-6">
              
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-500/10 p-3 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Secure Encrypted Payment</span>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-800 dark:text-white">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority Shipping</span>
                  <span className="text-slate-800 dark:text-white">${priorityShippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Tax (8.5%)</span>
                  <span className="text-slate-800 dark:text-white">${serviceTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-slate-800 dark:text-white">
                    {deliveryFee === 0 ? <span className="text-green-500 font-black">Free</span> : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <hr className="border-slate-200/50 dark:border-slate-800/50" />

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-500">Total Payable</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">${cartTotalSum.toFixed(2)}</div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 text-rose-600 text-xs font-semibold rounded-xl flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center space-x-2 
                  ${isProcessing 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white active:scale-95 cursor-pointer'}`}
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processing Payment...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Place Order • ${cartTotalSum.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-[9px] text-slate-400 font-semibold px-4">
                  By placing your order, you agree to VelocitiBites' Terms of Service and Privacy Policy.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
