import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, 
  Sparkles, Tag, AlertCircle, Percent, Check
} from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cartVersion, onCartChange }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState({});
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('Gourmet Kitchen');

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('velocitibites_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  // Load cart on mount or version changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('velocitibites_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCart(parsed.items || {});
        setRestaurantId(parsed.restaurantId);
        
        // Fetch restaurant details for name
        if (parsed.restaurantId) {
          fetch(`http://localhost:8000/api/restaurants/${parsed.restaurantId}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.name) setRestaurantName(data.name);
            })
            .catch(() => setRestaurantName('Gourmet Kitchen'));
        }
      } else {
        setCart({});
        setRestaurantId(null);
      }
    } catch (e) {
      console.error('Error loading cart:', e);
    }
  }, [isOpen, cartVersion]);

  // Sync cart shifts into localStorage
  const syncCart = (updatedCart) => {
    setCart(updatedCart);
    try {
      if (Object.keys(updatedCart).length === 0) {
        localStorage.removeItem('velocitibites_cart');
        localStorage.removeItem('velocitibites_applied_coupon');
        setAppliedCoupon(null);
        setRestaurantId(null);
      } else {
        localStorage.setItem('velocitibites_cart', JSON.stringify({
          restaurantId,
          items: updatedCart
        }));
      }
    } catch (e) {
      console.error('Error saving cart:', e);
    }
    if (onCartChange) onCartChange();
  };

  // Cart operations
  const handleIncrease = (item) => {
    const updated = {
      ...cart,
      [item.id]: {
        ...item,
        quantity: item.quantity + 1
      }
    };
    syncCart(updated);
  };

  const handleDecrease = (item) => {
    const existing = cart[item.id];
    if (!existing) return;
    let updated = { ...cart };
    if (existing.quantity <= 1) {
      delete updated[item.id];
    } else {
      updated[item.id] = {
        ...existing,
        quantity: existing.quantity - 1
      };
    }
    syncCart(updated);
  };

  const handleRemove = (itemId) => {
    let updated = { ...cart };
    delete updated[itemId];
    syncCart(updated);
  };

  const handleClear = () => {
    syncCart({});
    localStorage.removeItem('velocitibites_applied_coupon');
    setAppliedCoupon(null);
  };

  // Coupon handling
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess(false);

    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'FIRST50') {
      const promo = { code: 'FIRST50', discount: 50 };
      setAppliedCoupon(promo);
      localStorage.setItem('velocitibites_applied_coupon', JSON.stringify(promo));
      setCouponSuccess(true);
      setCouponInput('');
    } else if (cleanCode === 'VELOCITI20') {
      const promo = { code: 'VELOCITI20', discount: 20 };
      setAppliedCoupon(promo);
      localStorage.setItem('velocitibites_applied_coupon', JSON.stringify(promo));
      setCouponSuccess(true);
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try FIRST50 or VELOCITI20.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('velocitibites_applied_coupon');
    setCouponSuccess(false);
    setCouponError('');
  };

  // Pricing calculations
  const cartItemsArray = Object.values(cart);
  const cartSubtotal = cartItemsArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calculate discount
  const discountAmount = appliedCoupon ? (cartSubtotal * appliedCoupon.discount / 100) : 0;
  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);

  const deliveryMilestone = 50.00;
  const isFreeDelivery = discountedSubtotal >= deliveryMilestone;
  const deliveryFee = cartItemsArray.length === 0 ? 0 : (isFreeDelivery ? 0 : 3.99);
  
  const priorityShippingFee = cartItemsArray.length > 0 ? 2.00 : 0;
  const serviceTax = cartItemsArray.length > 0 ? (discountedSubtotal * 0.085) : 0; // Dynamic 8.5% GST
  
  const cartTotalSum = discountedSubtotal + priorityShippingFee + serviceTax + deliveryFee;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout', { 
      state: { 
        restaurant: { 
          id: restaurantId,
          name: restaurantName, 
          deliveryTime: isFreeDelivery ? '15-25 Mins' : '20-30 Mins' 
        } 
      } 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop glassmorphism overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200/50 dark:border-slate-800/80 shadow-2xl flex flex-col z-10 transition-transform duration-300 transform translate-x-0 animate-slide-in">
        
        {/* Header section */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Your Basket</h3>
              <p className="text-[10px] text-rose-500 font-bold">{restaurantName}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
            aria-label="Close Basket"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable list stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {cartItemsArray.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-300 flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-800 dark:text-white">Basket is Empty</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 leading-normal font-semibold max-w-[220px]">
                  Add dynamic culinary masterpieces from our gourmet menus to compile your order.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Free delivery indicator target */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wide">
                  <span className={isFreeDelivery ? 'text-green-600 dark:text-green-400' : 'text-slate-450'}>
                    {isFreeDelivery ? 'Free Premium Delivery Unlocked!' : 'Free Delivery Milestone'}
                  </span>
                  <span className="text-rose-500">${discountedSubtotal.toFixed(2)} / ${deliveryMilestone.toFixed(2)}</span>
                </div>

                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${Math.min((discountedSubtotal / deliveryMilestone) * 100, 100)}%` }}
                  />
                </div>

                {!isFreeDelivery && (
                  <p className="text-[9px] text-slate-400 leading-normal font-semibold">
                    Add <strong className="text-rose-500">${(deliveryMilestone - discountedSubtotal).toFixed(2)}</strong> more to waive the $3.99 delivery fee!
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Items List</span>
                  <button 
                    onClick={handleClear}
                    className="text-[9px] font-black uppercase tracking-wider text-rose-500 hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                {cartItemsArray.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150/40 dark:border-slate-850/60 text-left hover:border-rose-500/10 transition-all"
                  >
                    <div className="space-y-0.5 max-w-[60%]">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-150 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">${item.price.toFixed(2)} x {item.quantity}</div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                        <button 
                          onClick={() => handleDecrease(item)}
                          className="p-1 rounded-lg hover:bg-white/40 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
                          aria-label="Reduce"
                        >
                          <Minus className="w-2.5 h-2.5 stroke-[3]" />
                        </button>
                        <span className="text-xs font-black px-1.5 text-slate-700 dark:text-slate-200 select-none">{item.quantity}</span>
                        <button 
                          onClick={() => handleIncrease(item)}
                          className="p-1 rounded-lg hover:bg-white/40 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
                          aria-label="Add"
                        >
                          <Plus className="w-2.5 h-2.5 stroke-[3]" />
                        </button>
                      </div>

                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon promo field */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  <span>Promo Code / Offer</span>
                </div>

                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. FIRST50 or VELOCITI20" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider outline-none text-slate-800 dark:text-white focus:border-rose-500/50"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-900 dark:hover:bg-white active:scale-95 transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-green-500/10 p-2.5 rounded-xl border border-green-500/20 text-xs font-extrabold text-green-600 dark:text-green-400">
                    <div className="flex items-center space-x-1.5">
                      <Percent className="w-4 h-4 text-green-500" />
                      <span>Applied: {appliedCoupon.code} (-{appliedCoupon.discount}%)</span>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-[9px] uppercase tracking-wider text-rose-500 bg-rose-500/5 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponError && (
                  <div className="text-[10px] text-rose-500 font-semibold flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{couponError}</span>
                  </div>
                )}
                {couponSuccess && (
                  <div className="text-[10px] text-green-500 font-semibold flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Promo Applied Successfully! Discounted.</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Pricing calculations & checkout */}
        {cartItemsArray.length > 0 && (
          <div className="p-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-5 bg-slate-50/30 dark:bg-slate-950/10">
            <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-450 leading-normal">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-800 dark:text-slate-150">${cartSubtotal.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400 font-extrabold">
                  <span>Offer Discount ({appliedCoupon.discount}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Priority Packaging Handler</span>
                <span className="text-slate-800 dark:text-slate-150">${priorityShippingFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>GST / Service Tax (8.5%)</span>
                <span className="text-slate-800 dark:text-slate-150">${serviceTax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Courier Fee</span>
                <span className="text-slate-800 dark:text-slate-150">
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 dark:text-green-400 font-extrabold uppercase text-[9px] tracking-wide bg-green-500/10 px-2 py-0.5 rounded-md">Free</span>
                  ) : (
                    `$${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              
              <hr className="border-slate-200/50 dark:border-slate-800/50" />
              
              <div className="flex items-center justify-between text-sm font-black text-slate-800 dark:text-white pt-1">
                <span>Grand Total Due</span>
                <span className="text-rose-500">${cartTotalSum.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Link Trigger */}
            <button 
              onClick={handleCheckout}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs shadow-lg flex items-center justify-center space-x-1.5 active:scale-98 hover:shadow-rose-500/10 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <span>Proceed to Safe Checkout</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
