"use client";

import React, { useState, useEffect } from "react";
import { MenuItem, MenuItemOption, MenuItemOptionGroup } from "@/lib/mockData";
import { useAudio } from "@/context/AudioContext";
import { X, Plus, Minus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: MenuItem, selectedOptions: MenuItemOption[], quantity: number) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onAdd
}) => {
  const { play } = useAudio();
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, MenuItemOption[]>>({});

  // Reset local state when item changes
  useEffect(() => {
    if (item) {
      setQuantity(1);
      const initialSelections: Record<string, MenuItemOption[]> = {};
      
      // Auto-select first option for required single-select groups
      item.optionGroups?.forEach(group => {
        if (group.required && group.maxSelections === 1 && group.options.length > 0) {
          initialSelections[group.id] = [group.options[0]];
        } else {
          initialSelections[group.id] = [];
        }
      });
      
      setSelectedOptions(initialSelections);
    }
  }, [item]);

  if (!item || !isOpen) return null;

  const handleOptionToggle = (group: MenuItemOptionGroup, option: MenuItemOption) => {
    play("pop");
    setSelectedOptions(prev => {
      const currentGroupSelections = prev[group.id] || [];
      const isAlreadySelected = currentGroupSelections.some(o => o.id === option.id);

      let nextSelections: MenuItemOption[] = [];

      if (group.maxSelections === 1) {
        // Radio behavior
        nextSelections = isAlreadySelected ? (group.required ? [option] : []) : [option];
      } else {
        // Checkbox behavior
        if (isAlreadySelected) {
          nextSelections = currentGroupSelections.filter(o => o.id !== option.id);
        } else {
          // Check limit
          if (currentGroupSelections.length < group.maxSelections) {
            nextSelections = [...currentGroupSelections, option];
          } else {
            // Replace first or do nothing (we will do nothing to respect maxSelections limit)
            nextSelections = currentGroupSelections;
          }
        }
      }

      return {
        ...prev,
        [group.id]: nextSelections
      };
    });
  };

  // Check validations
  const isAddDisabled = () => {
    if (!item.optionGroups) return false;
    
    return item.optionGroups.some(group => {
      if (group.required) {
        const selections = selectedOptions[group.id] || [];
        return selections.length === 0;
      }
      return false;
    });
  };

  // Calculate prices
  const basePrice = item.price;
  const optionsPrice = Object.values(selectedOptions)
    .flat()
    .reduce((sum, opt) => sum + opt.price, 0);
  const totalPrice = (basePrice + optionsPrice) * quantity;
  const dopamineEarned = item.dopaminePoints * quantity;

  const handleAdd = () => {
    const flattenedOptions = Object.values(selectedOptions).flat();
    onAdd(item, flattenedOptions, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-zinc-400 hover:text-white border border-zinc-800 backdrop-blur-sm hover:scale-110 active:scale-95 transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Food Banner Image */}
          <div className="relative h-48 w-full bg-zinc-800">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-block px-2 py-0.5 rounded bg-neon-pink text-white text-[10px] font-black uppercase tracking-widest text-neon-glow-pink animate-pulse mb-1.5">
                +{dopamineEarned} Brain Points
              </span>
              <h2 className="text-xl font-black text-white leading-tight">{item.name}</h2>
            </div>
          </div>

          {/* Content Scroll Area */}
          <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
            <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>

            {/* Option Groups */}
            {item.optionGroups?.map(group => {
              const selections = selectedOptions[group.id] || [];
              return (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-300">
                      {group.name}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold">
                      {group.required ? (
                        <span className="text-neon-pink px-1.5 py-0.5 rounded bg-neon-pink/10 border border-neon-pink/30">Required</span>
                      ) : (
                        <span className="text-zinc-500">Optional</span>
                      )}
                      <span className="text-zinc-500">
                        (Max {group.maxSelections})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {group.options.map(option => {
                      const isSelected = selections.some(o => o.id === option.id);
                      return (
                        <div
                          key={option.id}
                          onClick={() => handleOptionToggle(group, option)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer select-none transition-all duration-200 ${
                            isSelected
                              ? "bg-zinc-800/80 border-neon-pink text-white shadow-[0_0_15px_rgba(255,0,127,0.15)]"
                              : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                              isSelected
                                ? "bg-neon-pink border-neon-pink text-white"
                                : "border-zinc-700 bg-zinc-900"
                            }`}>
                              {isSelected && <Check className="h-3 w-3 stroke-[4]" />}
                            </div>
                            <span className="font-bold text-sm">{option.name}</span>
                          </div>
                          {option.price > 0 && (
                            <span className={`text-xs font-black ${isSelected ? "text-neon-pink" : "text-zinc-500"}`}>
                              +${option.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
              <span className="font-extrabold text-sm uppercase tracking-wider text-zinc-300">Quantity</span>
              <div className="flex items-center space-x-4 bg-zinc-950 border border-zinc-800 rounded-xl p-1.5">
                <button
                  onClick={() => {
                    play("pop");
                    setQuantity(q => Math.max(1, q - 1));
                  }}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-black text-white text-lg">{quantity}</span>
                <button
                  onClick={() => {
                    play("pop");
                    setQuantity(q => q + 1);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="border-t border-zinc-800 bg-zinc-950/60 p-6 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Price</span>
              <span className="text-2xl font-black text-white">${totalPrice.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleAdd}
              disabled={isAddDisabled()}
              className="flex-1 max-w-xs py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-white border-0 bg-gradient-to-r from-neon-pink to-neon-purple shadow-[0_0_20px_rgba(255,0,127,0.3)] hover:shadow-[0_0_30px_rgba(255,0,127,0.6)] disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Feed My Brain (+{dopamineEarned})
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default ItemModal;
