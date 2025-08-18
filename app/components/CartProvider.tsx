"use client";
import { CartProvider as ReactUseCartProvider } from "react-use-cart";
import { ReactNode } from "react";

interface CartProviderProps {
  children: ReactNode;
}

export default function CartProvider({ children }: CartProviderProps) {
  return (
    <ReactUseCartProvider 
      id="airxpress-store"
    >
      {children}
    </ReactUseCartProvider>
  );
}