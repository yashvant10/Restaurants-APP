import React, { useState } from 'react';
import { ChefHat, Plus, Minus } from 'lucide-react';

export default function MenuItemCard({ item, cartQuantity = 0, onAdd, onRemove }) {
  const { name, description, price, image, is_veg } = item;
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:border-rose-500/10 hover:scale-[1.01] transition-all duration-300 overflow-hidden flex flex-col h-full text-left relative">
      
      {/* 1. Image Showcase Area */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        
        {/* Veg / Non-Veg Indicator Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center justify-center p-1.5 rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-md border border-slate-200/40 dark:border-slate-800/40">
          <div className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center ${is_veg ? 'border-green-600' : 'border-red-650'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${is_veg ? 'bg-green-600' : 'bg-red-650'}`} />
          </div>
        </div>

        {/* Fallback image rendering logic */}
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-rose-500/20 flex flex-col items-center justify-center text-rose-500 dark:text-rose-400 p-4">
            <ChefHat className="w-10 h-10 stroke-[1.5] mb-2 animate-pulse" />
            <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-80">Gourmet Delight</span>
          </div>
        ) : (
          <img 
            src={image} 
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 select-none animate-fade-in"
            loading="lazy"
          />
        )}
      </div>

      {/* 2. Item Metadata & Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white truncate">
            {name}
          </h4>
          
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-2 min-h-[2.2rem]">
            {description}
          </p>
        </div>

        {/* 3. Action Buttons & Pricing */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Price */}
          <div className="text-sm font-black text-rose-500 dark:text-rose-450">
            ${price.toFixed(2)}
          </div>

          {/* Cart Quantity Controller Button */}
          {cartQuantity > 0 ? (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl p-0.5 shadow-md shadow-rose-500/10">
              <button 
                onClick={onRemove}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white cursor-pointer"
                aria-label="Decrease Quantity"
              >
                <Minus className="w-3 h-3 stroke-[3]" />
              </button>
              <span className="text-xs font-black px-1.5 select-none">{cartQuantity}</span>
              <button 
                onClick={onAdd}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white cursor-pointer"
                aria-label="Increase Quantity"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onAdd}
              className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-rose-500 dark:bg-slate-950 dark:hover:from-amber-500 dark:hover:to-rose-500 text-slate-700 hover:text-white dark:text-slate-450 border border-slate-200/50 hover:border-transparent dark:border-slate-800/80 font-black text-xs transition-all duration-200 flex items-center justify-center space-x-1 hover:shadow-lg hover:shadow-rose-500/10 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-0.5 stroke-[3]" />
              <span>Add</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
