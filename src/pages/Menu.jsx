import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, Search, Sparkles, ChefHat, X, ChevronRight, 
  ArrowRight, Clock, Star, Trash2, Plus, Minus, Info, AlertTriangle, Check
} from 'lucide-react';
import RestaurantHeader from '../components/RestaurantHeader';
import MenuItemCard from '../components/MenuItemCard';
import CartDrawer from '../components/CartDrawer';

export default function Menu() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  // Primary API States
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  // Cart Drawer & Checkout States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  // cartVersion forces synchronization when cart is modified inside the sidebar drawer
  const [cartVersion, setCartVersion] = useState(0);

  // Initialize cart state scoped to current restaurant from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('velocitibites_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.restaurantId === restaurantId) {
          return parsed.items || {};
        }
      }
    } catch (e) {
      console.error('Error parsing cart:', e);
    }
    return {};
  });

  // Reload local cart state from localStorage when notified of drawer updates
  const handleCartChange = () => {
    setCartVersion(prev => prev + 1);
    try {
      const stored = localStorage.getItem('velocitibites_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.restaurantId === restaurantId) {
          setCart(parsed.items || {});
          return;
        }
      }
    } catch (e) {}
    setCart({});
  };

  // Sync cart shifts into localStorage and bump version to keep CartDrawer updated
  useEffect(() => {
    try {
      localStorage.setItem('velocitibites_cart', JSON.stringify({
        restaurantId,
        items: cart
      }));
      setCartVersion(prev => prev + 1);
    } catch (e) {
      console.error('Error syncing cart:', e);
    }
  }, [cart, restaurantId]);

  // Fetch Restaurant metadata and menu items
  const fetchMenuData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Restaurant details
      const resResponse = await fetch(`http://localhost:8000/api/restaurants/${restaurantId}`);
      if (!resResponse.ok) {
        throw new Error(`Restaurant query failed (Status: ${resResponse.status})`);
      }
      const resData = await resResponse.json();
      setRestaurant({
        ...resData,
        image: resData.image_url || resData.image,
        deliveryTime: resData.delivery_time || resData.deliveryTime
      });

      // 2. Fetch Menu items
      const menuResponse = await fetch(`http://localhost:8000/api/restaurants/${restaurantId}/menu`);
      if (!menuResponse.ok) {
        throw new Error(`Menu query failed (Status: ${menuResponse.status})`);
      }
      const menuData = await menuResponse.json();
      setMenuItems(menuData);
    } catch (err) {
      console.error('Error fetching menu details:', err);
      setError('We had trouble reaching the kitchen. Verify the backend service is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, [restaurantId]);

  // Derive categories dynamically from fetched menus!
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Cart operations
  const handleAddToCart = (item) => {
    // Check if basket holds items from another restaurant
    try {
      const stored = localStorage.getItem('velocitibites_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.restaurantId && parsed.restaurantId !== restaurantId && Object.keys(parsed.items).length > 0) {
          setPendingItem(item);
          setShowReplaceModal(true);
          return;
        }
      }
    } catch (e) {}

    setCart(prev => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          ...item,
          quantity: existing ? existing.quantity + 1 : 1
        }
      };
    });
  };

  const handleDecreaseQuantity = (item) => {
    setCart(prev => {
      const existing = prev[item.id];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return {
        ...prev,
        [item.id]: {
          ...existing,
          quantity: existing.quantity - 1
        }
      };
    });
  };

  const handleClearAndAdd = () => {
    if (pendingItem) {
      setCart({
        [pendingItem.id]: {
          ...pendingItem,
          quantity: 1
        }
      });
      setPendingItem(null);
    }
    setShowReplaceModal(false);
  };

  const handleClearCart = () => {
    setCart({});
  };

  // Pricing calculations keeping identical math formulas and coupons with CartDrawer
  const cartItemsArray = Object.values(cart);
  const cartTotalQuantity = cartItemsArray.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItemsArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('velocitibites_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen to cart changes to dynamically reload any coupons applied in the drawer
  useEffect(() => {
    try {
      const saved = localStorage.getItem('velocitibites_applied_coupon');
      setAppliedCoupon(saved ? JSON.parse(saved) : null);
    } catch {}
  }, [cartVersion, isCartOpen]);

  const discountAmount = appliedCoupon ? (cartSubtotal * appliedCoupon.discount / 100) : 0;
  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);

  const priorityShippingFee = cartTotalQuantity > 0 ? 2.00 : 0;
  const serviceTax = cartTotalQuantity > 0 ? (discountedSubtotal * 0.085) : 0; // Dynamic 8.5% GST
  
  const deliveryMilestone = 50.00;
  const isFreeDelivery = discountedSubtotal >= deliveryMilestone;
  const deliveryFee = cartTotalQuantity === 0 ? 0 : (isFreeDelivery ? 0 : 3.99);
  const cartTotalSum = discountedSubtotal + priorityShippingFee + serviceTax + deliveryFee;

  // Filter Logic
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesVeg = !vegOnly || item.is_veg === true;
    return matchesSearch && matchesCategory && matchesVeg;
  });

  // Theme Sync (Light/Dark support)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const RestaurantSkeleton = () => (
    <div className="space-y-8 animate-pulse max-w-4xl mx-auto w-full px-6 py-8 text-left">
      <div className="h-64 sm:h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 -mt-20 space-y-4">
        <div className="h-4 bg-rose-500/10 rounded-full w-24" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
        <div className="h-4 bg-slate-250 dark:bg-slate-800/50 rounded-lg w-1/2" />
      </div>
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden h-64 flex flex-col justify-between p-5">
            <div className="h-28 bg-slate-200 dark:bg-slate-850 rounded-2xl w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded-md w-2/3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-850 rounded-xl w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  const ErrorPage = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-center">
      <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-10 max-w-lg space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-md">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Kitchen Disconnected</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal font-semibold">
            {error || "We encountered an issue loading this restaurant's customized menu list."}
          </p>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <Link 
            to="/customer-dashboard" 
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-450 transition-all cursor-pointer"
          >
            Back to Dashboard
          </Link>
          <button 
            onClick={fetchMenuData}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs transition-all shadow-md cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col"><RestaurantSkeleton /></div>;
  if (error || !restaurant) return <ErrorPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col">
      
      {/* 1. Header Banner & Info Block */}
      <RestaurantHeader restaurant={restaurant} />

      {/* 2. Menu Exploration Filter Bars & Listing Grid */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* Controls Panel (Search & Veg Toggle) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm text-left">
          
          {/* Search Input Box */}
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 border border-slate-200/60 dark:border-slate-800/80 w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input 
              type="text" 
              placeholder={`Search in ${restaurant.name}'s kitchen...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs w-full py-3.5 outline-none font-semibold text-slate-700 dark:text-slate-150 placeholder-slate-400 dark:placeholder-slate-600"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Veg Only Toggle Switch */}
          <div className="flex items-center justify-between sm:justify-start space-x-3.5 flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/30">
            <div className="text-left">
              <div className="text-xs font-black text-slate-700 dark:text-slate-200">Vegetarian Only</div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hygienic Green Grid</div>
            </div>
            
            <button 
              onClick={() => setVegOnly(!vegOnly)}
              className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer duration-200 ${vegOnly ? 'bg-green-600' : 'bg-slate-255 dark:bg-slate-800'}`}
              aria-label="Toggle Vegetarian Only"
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${vegOnly ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>

        {/* Dynamic Category Pill Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 text-left select-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
                selectedCategory === category 
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/10' 
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/80 text-slate-500 dark:text-slate-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Dynamic Grid Layout */}
        {filteredMenuItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-10 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-400 flex items-center justify-center mx-auto">
              <ChefHat className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight text-slate-800 dark:text-white">Dish Not Found</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal font-semibold">
                No items match your query. Try clearing your search keywords or switching filters.
              </p>
            </div>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setVegOnly(false); }}
              className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredMenuItems.map(item => (
              <MenuItemCard 
                key={item.id} 
                item={item}
                cartQuantity={cart[item.id]?.quantity || 0}
                onAdd={() => handleAddToCart(item)}
                onRemove={() => handleDecreaseQuantity(item)}
              />
            ))}
          </div>
        )}

      </div>

      {/* 3. Floating Sticky Cart Drawer Trigger Button */}
      {cartTotalQuantity > 0 && !isCartOpen && (
        <div className="fixed bottom-6 inset-x-0 z-25 max-w-lg mx-auto px-6 animate-slide-up">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-2xl py-4 px-6 shadow-xl flex items-center justify-between group transform transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-black">{cartTotalQuantity} {cartTotalQuantity === 1 ? 'Gourmet Dish' : 'Gourmet Dishes'}</div>
                <div className="text-[10px] text-rose-100 font-bold uppercase tracking-wider">Scoped Basket Active</div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-right font-black text-xs">
              <span>View Basket</span>
              <span className="bg-white/25 px-2 py-0.5 rounded-lg ml-1 font-black">${cartTotalSum.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-0.5" />
            </div>
          </button>
        </div>
      )}

      {/* 4. Highly Polished Sliding Cart Drawer Panel Component */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartVersion={cartVersion}
        onCartChange={handleCartChange}
      />

      {/* 5. Checkout Success Modal Overlay */}
      {isCheckoutSuccess && (
        <div className="fixed inset-0 z-40 overflow-hidden flex items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md animate-fade-in" />
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl animate-scale-up space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto shadow-inner border border-green-500/10">
              <Check className="w-10 h-10 stroke-[3] animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Order Dispatched!</h2>
              <div className="inline-flex items-center space-x-1.5 bg-green-500/10 text-green-600 dark:bg-green-500/15 dark:text-green-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
                <span>Priority VIP Ticket #2092</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold px-4 pt-2">
                Your gourmet plate request was successfully compiled and sent to **{restaurant.name}**. Savor the flavor in 20-30 minutes!
              </p>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => {
                  handleClearCart();
                  setIsCheckoutSuccess(false);
                  setIsCartOpen(false);
                  navigate('/customer-dashboard');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Return to Deliveries Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Gourmet Basket Replacement Warning Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-40 overflow-hidden flex items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md animate-fade-in" />
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl animate-scale-up space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">Start a New Basket?</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold px-2">
                Your basket contains dishes from another master kitchen. Would you like to clear it and start a new order at **{restaurant.name}** instead?
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button 
                onClick={() => { setShowReplaceModal(false); setPendingItem(null); }}
                className="w-1/2 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all cursor-pointer"
              >
                No, Retain
              </button>
              <button 
                onClick={handleClearAndAdd}
                className="w-1/2 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition-all shadow-md cursor-pointer"
              >
                Clear & Add
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
