"use client";

import React, { useState } from "react";
import "@/styles/globals.css";
import { AudioProvider } from "@/context/AudioContext";
import { StateProvider } from "@/context/StateContext";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { ConfettiEffect } from "@/components/ConfettiEffect";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>Dopamine Delivery ⚡</title>
        <meta name="description" content="Satisfy your delivery app impulses without spending real money." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen flex flex-col">
        <AudioProvider>
          <StateProvider>
            {/* Header / Persistent HUD */}
            <Header onCartOpen={() => setIsCartOpen(true)} />
            
            {/* Main Content Area */}
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            
            {/* Sliding Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            
            {/* Confetti effect when checking out */}
            <ConfettiEffect />
          </StateProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
