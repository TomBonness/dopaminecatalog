"use client";

import React, { useRef } from "react";
import { useAppState } from "@/context/StateContext";
import { MOCK_RESTAURANTS } from "@/lib/mockData";
import { X, Trash2, Plus, Minus, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    placeOrder,
    moneySaved
  } = useAppState();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Find the restaurant matching the items in the cart
  const firstCartItem = cart[0];
  const restaurant = firstCartItem
    ? MOCK_RESTAURANTS.find(r =>
        r.menu.some(category =>
          category.items.some(item => item.id === firstCartItem.menuItem.id)
        )
      )
    : null;

  // Calculate pricing
  const subtotal = cart.reduce((sum, item) => {
    const optionsCost = item.selectedOptions.reduce((oSum, o) => oSum + o.price, 0);
    return sum + (item.menuItem.price + optionsCost) * item.quantity;
  }, 0);

  const deliveryFee = restaurant?.deliveryFee || 0;
  const tax = subtotal * 0.085; // 8.5% mock tax
  const total = subtotal > 0 ? subtotal + deliveryFee + tax : 0;
  const totalPoints = cart.reduce((sum, item) => sum + (item.menuItem.dopaminePoints * item.quantity), 0) + 100;

  const handleCheckout = () => {
    if (!restaurant) return;
    placeOrder(restaurant);
    onClose();
    router.push("/tracking");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              ref={drawerRef}
              className="w-screen max-w-md border-l border-zinc-800 bg-zinc-900/95 shadow-2xl flex flex-col h-[100dvh]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35 }}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="h-6 w-6 text-neon-pink text-neon-glow-pink animate-pulse" />
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">Your Serotonin Bag</h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body (Scrollable Cart Items) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <span className="text-5xl">😭</span>
                    <h3 className="font-extrabold text-zinc-300">Your bag is empty!</h3>
                    <p className="text-xs text-zinc-500 max-w-[200px]">
                      Your brain is starving. Add some neon food to trigger instant pleasure.
                    </p>
                  </div>
                ) : (
                  cart.map(item => {
                    const optionsCost = item.selectedOptions.reduce((s, o) => s + o.price, 0);
                    const itemTotal = (item.menuItem.price + optionsCost) * item.quantity;
                    return (
                      <motion.div
                        key={item.cartItemId}
                        layout
                        className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-start justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-sm text-white truncate">{item.menuItem.name}</h4>
                          {item.selectedOptions.length > 0 && (
                            <p className="text-[10px] text-zinc-500 mt-1 space-x-1">
                              {item.selectedOptions.map(o => (
                                <span key={o.id} className="inline-block px-1 rounded bg-zinc-900 border border-zinc-800">
                                  +{o.name}
                                </span>
                              ))}
                            </p>
                          )}
                          <div className="flex items-center space-x-3 mt-3">
                            <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.cartItemId, -1)}
                                className="h-6 w-6 flex items-center justify-center rounded bg-zinc-950 text-zinc-400 hover:text-white"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-5 text-center text-xs font-black text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.cartItemId, 1)}
                                className="h-6 w-6 flex items-center justify-center rounded bg-zinc-950 text-zinc-400 hover:text-white"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="text-zinc-600 hover:text-red-500 transition p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="block font-black text-sm text-white">${itemTotal.toFixed(2)}</span>
                          <span className="block text-[9px] font-bold text-neon-cyan mt-1">
                            +{item.menuItem.dopaminePoints * item.quantity} XP
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer (Summary & Checkout) */}
              {cart.length > 0 && restaurant && (
                <div className="p-6 border-t border-zinc-800 bg-zinc-950/60 space-y-4">
                  <div className="space-y-2 text-xs font-bold text-zinc-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="text-white">${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbon Offset / Tax</span>
                      <span className="text-white">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
                      <span>Fake Total</span>
                      <span className="text-neon-pink text-neon-glow-pink">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold flex items-center space-x-2.5">
                    <span>💵</span>
                    <span>
                      You save <strong className="text-white">${total.toFixed(2)}</strong> in real money by choosing simulated food!
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider text-black border-2 border-transparent bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,127,0.6)] animate-rainbow-glow active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                  >
                    <span>PLACE FREE ORDER (+{totalPoints} XP)</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
