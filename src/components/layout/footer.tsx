import Link from "next/link";
import { Cpu, Mail, Phone, MapPin, Share2, Globe, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="bg-accent p-3 rounded-2xl group-hover:rotate-12 transition-all duration-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                <Cpu className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter font-display italic">
                Kelectronica<span className="text-accent">EC</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed font-medium">
              Hardware de élite clasificado para misiones de alto rendimiento. Ingeniería táctica para visionarios del campo digital.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-3 glass rounded-2xl hover:text-primary transition-all duration-500 hover:scale-110">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 glass rounded-2xl hover:text-primary transition-all duration-500 hover:scale-110">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 glass rounded-2xl hover:text-primary transition-all duration-500 hover:scale-110">
                <MessageSquare className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 tracking-tight uppercase text-xs">Enlaces Rápidos</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/build" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  Arma tu PC
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  Nosotros
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 tracking-tight uppercase text-xs">Categorías Pro</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/categories/gaming" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                  Gaming
                </Link>
              </li>
              <li>
                <Link href="/categories/workstation" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                  Workstation
                </Link>
              </li>
              <li>
                <Link href="/categories/equipos-escritorio" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                  Equipos de Escritorio
                </Link>
              </li>
              <li>
                <Link href="/components" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                  Componentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 tracking-tight uppercase text-xs">Centro de Ayuda</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 p-3 glass rounded-xl">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-gray-300 font-medium">+593 99 123 4567</span>
              </li>
              <li className="flex items-center gap-3 p-3 glass rounded-xl">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-gray-300 font-medium">ventas@kelectronicaec.com</span>
              </li>
              <li className="flex items-start gap-3 p-3 glass rounded-xl">
                <MapPin className="h-4 w-4 text-primary mt-1" />
                <span className="text-gray-300 font-medium">Quito, Ecuador</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">
            &copy; {new Date().getFullYear()} KelectronicaEC. PROTOCOLO UI-UX PRO MAX ACTIVADO.
          </p>
          <div className="flex gap-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Soporte Táctico</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
