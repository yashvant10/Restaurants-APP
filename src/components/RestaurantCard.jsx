import React, { useState } from 'react';
import { Star, Clock, ChefHat, ArrowRight, Heart } from 'lucide-react';

export default function RestaurantCard({ restaurant, onViewMenu }) {
  const { name, cuisine, image, rating, deliveryTime } = restaurant;
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Helper to pick rating badge colors dynamically
  const getRatingBadgeClass = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 4.5) {
      return 'bg-green-500/10 text-green-600 dark:bg-green-500/15 dark:text-green-400 border-green-500/20';
    }
    if (numScore >= 4.0) {
      return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400 border-slate-500/20';
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:border-rose-500/20 hover:scale-[1.01] transition-all duration-300 overflow-hidden flex flex-col h-full text-left relative">
      
      {/* 1. Image Showcase Area */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        
        {/* Heart Favorite Trigger */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md text-slate-400 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Toggle Favorite"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-500'}`} />
        </button>

        {/* Est Delivery Time Glassmorphic Pill */}
        <div className="absolute bottom-4 left-4 z-10 inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md text-white border border-white/10 text-[10px] font-extrabold tracking-wider uppercase">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>{deliveryTime}</span>
        </div>

        {/* Fallback image rendering logic */}
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-rose-500/20 flex flex-col items-center justify-center text-rose-500 dark:text-rose-450 p-4">
            <ChefHat className="w-12 h-12 stroke-[1.5] mb-2 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">Gourmet Selection</span>
          </div>
        ) : (
          <img 
            src={image} 
            alt={`Facade of ${name}`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
            loading="lazy"
          />
        )}

        {/* Hover image overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* 2. Restaurant Metadata & Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Name and Rating */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white group-hover:text-rose-500 transition-colors truncate">
              {name}
            </h4>
            
            {/* Rating Badging */}
            <div className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold leading-normal ${getRatingBadgeClass(rating)}`}>
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{rating}</span>
            </div>
          </div>

          {/* Cuisine Categories */}
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold truncate">
            {cuisine}
          </p>
        </div>

        {/* 3. Action Buttons */}
        <button 
          onClick={() => onViewMenu && onViewMenu(restaurant)}
          className="w-full bg-slate-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-rose-500 dark:bg-slate-950 dark:hover:from-amber-500 dark:hover:to-rose-500 text-slate-600 hover:text-white dark:text-slate-400 border border-slate-200/50 hover:border-transparent dark:border-slate-800/80 font-black text-xs py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-1.5 hover:shadow-lg hover:shadow-rose-500/10 cursor-pointer"
        >
          <span>View Menu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>

    </div>
  );
}
