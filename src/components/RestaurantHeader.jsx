import React from 'react';
import { Star, Clock, ArrowLeft, ChevronRight, ChefHat, Heart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RestaurantHeader({ restaurant }) {
  const navigate = useNavigate();
  const { name, cuisine, rating, deliveryTime, image } = restaurant;

  return (
    <div className="relative w-full">
      {/* 1. Backdrop Facade Image with Contrast Vignette */}
      <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-slate-900">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover opacity-60 scale-105 blur-[2px]"
        />
        {/* Soft shadow vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20"></div>
        
        {/* Navigation Action Buttons on top of image */}
        <div className="absolute top-6 left-6 z-10 flex items-center justify-between w-[calc(100%-3rem)]">
          <button 
            onClick={() => navigate('/customer-dashboard')}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95 border border-white/10 text-xs font-black shadow-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Grid</span>
          </button>

          <div className="flex items-center space-x-2">
            <button className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10 cursor-pointer">
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10 cursor-pointer">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Breadcrumbs overlaid on the image bottom-left */}
        <div className="absolute bottom-6 left-6 text-white text-left hidden md:block">
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-rose-350">
            <span>VelocitiBites VIP</span>
            <ChevronRight className="w-3 h-3" />
            <span>Active Kitchens</span>
            <ChevronRight className="w-3 h-3 text-white" />
            <span className="text-white">{name}</span>
          </div>
        </div>
      </div>

      {/* 2. Overlapping High-Fidelity Glassmorphic Detail Card */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-xl text-left space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Restaurant Title & Cuisine Info */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2 bg-rose-500/10 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                <ChefHat className="w-3 h-3" />
                <span>Verified Gourmet Chef</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                {name}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                {cuisine}
              </p>
            </div>

            {/* Quick Metrics (Rating & Delivery Time) */}
            <div className="flex items-center space-x-4">
              {/* Rating Box */}
              <div className="bg-green-500/10 dark:bg-green-500/15 border border-green-500/20 px-4 py-2.5 rounded-2xl text-center">
                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 font-black text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{rating}</span>
                </div>
                <div className="text-[8px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-extrabold mt-0.5">
                  100+ Reviews
                </div>
              </div>

              {/* Delivery Speed Box */}
              <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 px-4 py-2.5 rounded-2xl text-center">
                <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-black text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{deliveryTime}</span>
                </div>
                <div className="text-[8px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-extrabold mt-0.5">
                  Priority Speed
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200/50 dark:border-slate-800/50" />

          {/* Premium delivery guarantees summary */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span>100% Hygienic Food</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Super Fast Delivery under 25 mins</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Free VIP Shipping Available</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
