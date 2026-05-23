"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, Menu, X, Cpu, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/components/providers/cart-context";
import { MiniCart } from "./mini-cart";

export function Header() {
  const { data: session, status } = useSession();
  const { itemCount, setIsMiniCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`glass rounded-[32px] px-10 flex justify-between items-center h-24 transition-all duration-700 ${
          scrolled ? "bg-bg/80 border-primary/20 backdrop-blur-3xl" : "bg-white/2 border-white/5"
        }`}>
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="bg-accent p-3 rounded-2xl group-hover:rotate-[15deg] transition-all duration-700 shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                <Cpu className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-black text-white tracking-tight font-display">
                Kelectronica<span className="text-accent">EC</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-12">
            <Link href="/products" className="text-muted hover:text-white transition-all font-black uppercase text-xs tracking-[0.2em]">
              Productos
            </Link>
            <Link href="/build" className="text-muted hover:text-white transition-all font-black uppercase text-xs tracking-[0.2em]">
              Armar PC
            </Link>
            <Link href="/categories" className="text-muted hover:text-white transition-all font-black uppercase text-xs tracking-[0.2em]">
              Categorías
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-primary transition">
              <Search className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setIsMiniCartOpen(true)}
              className="p-2 text-gray-400 hover:text-primary transition relative group"
            >
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                  {itemCount}
                </span>
              )}
            </button>

            <div className="h-6 w-[1px] bg-white/10 mx-2" />

            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : session ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 pl-2 pr-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 transition">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">{session.user.name || "Mi Cuenta"}</span>
                </button>
                <div className="absolute right-0 mt-2 w-56 rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.6)]" style={{ background: "oklch(15% 0.01 260 / 0.95)", backdropFilter: "blur(24px)" }}>
                  <div className="px-4 py-2 border-b border-white/10 mb-2">
                    <p className="text-xs text-gray-400">Identificado como</p>
                    <p className="text-sm font-semibold text-white truncate">{session.user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-primary/20 hover:text-white transition"
                  >
                    Mi Cuenta
                  </Link>
                  <Link
                    href="/account/orders"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-primary/20 hover:text-white transition"
                  >
                    Mis Pedidos
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-accent hover:bg-accent/10 transition"
                    >
                      Panel Admin
                    </Link>
                  )}
                  {session.user.role === "AUDITOR" && (
                    <Link
                      href="/auditor"
                      className="block px-4 py-2 text-sm text-amber-400 hover:bg-amber-400/10 transition"
                    >
                      Consola de Auditoría
                    </Link>
                  )}
                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Ingresar</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl p-4 animate-in slide-in-from-top-4 duration-300 relative z-50 border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.6)]" style={{ background: "oklch(15% 0.01 260 / 0.97)", backdropFilter: "blur(24px)" }}>
            <div className="flex flex-col space-y-4">
              <Link
                href="/products"
                className="text-gray-300 hover:text-primary transition p-2 rounded-lg hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Productos
              </Link>
              <Link
                href="/build"
                className="text-gray-300 hover:text-primary transition p-2 rounded-lg hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Arma tu PC
              </Link>
              <Link
                href="/categories"
                className="text-gray-300 hover:text-primary transition p-2 rounded-lg hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categorías
              </Link>
            </div>
          </div>
        )}
      </nav>
      <MiniCart />
    </header>
  );
}
