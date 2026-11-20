'use client';

import React from 'react';
import { StoreProvider } from '../context/StoreContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import ToastContainer from './ToastContainer';

export default function Providers({ children }) {
  return (
    <StoreProvider>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <SearchModal />
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
