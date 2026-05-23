# TechStore Pro Max: Manifiesto de Diseño (Liquid Glass)

## 🌌 Filosofía Core
**Immersive Luxury / Liquid Glass**. El hardware de alto rendimiento requiere una interfaz que se sienta táctil, precisa e inmersiva. Empleamos fondos cósmicos profundos, superficies traslúcidas complejas (cristal líquido) y resplandores tácticos que guían al usuario sin saturar la vista.

## 🎨 Paleta de Color (OKLch)

Para mantener uniformidad perceptual y superposiciones orgánicas, operamos bajo tokens OKLch puros.

| Token | Rol | OKLch Value | Aplicación |
|-------|------|-------------|-------|
| `--bg` | Cosmic Canvas | `oklch(15% 0.02 260)` | Fondo principal (deep space) |
| `--surface` | Liquid Glass | `oklch(100% 0 0 / 0.05)` | Superficies base de tarjetas |
| `--fg` | Texto Primario | `oklch(92% 0.01 250)` | Lectura principal |
| `--muted` | Texto Secundario | `oklch(70% 0.15 270)` | Metadatos y labels |
| `--primary` | Identidad | `oklch(52% 0.25 285)` | Branding core (Púrpura Eléctrico) |
| `--accent` | CTAs y Error | `oklch(62% 0.22 15)` | Botones críticos, fallos (Rose) |
| `--success` | Sistema | `oklch(70% 0.15 150)` | Stock disponible, confirmaciones |

## 🔤 Tipografía
- **Display:** `Montserrat` (Black/Bold, `tracking-tight`). Usado en H1/H2 y números destacados.
- **Body & Datos:** `Inter` (Medium/Regular). Legibilidad máxima para fichas técnicas y formularios.

---

## 💎 1. Tokens de Superficie (Liquid Glass)
Las superficies principales deben emular un panel de cristal ahumado sobre el fondo cósmico.

**Receta Tailwind Base:**
```html
<div className="bg-white/2 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
  <!-- Contenido -->
</div>
```
* **Fondo:** `bg-white/2` (mínima opacidad para máxima transparencia).
* **Cristal:** `backdrop-blur-3xl` (desenfoque profundo para profundidad infinita).
* **Corte:** `border border-white/10` (define la silueta técnica).

---

## ✨ 2. Componentes Interactivos

### Botón "Brillo de Resina"
CTAs primarios con efecto de profundidad y brillo dinámico.
```html
<button className="relative overflow-hidden bg-primary shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]">
  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-45 -translate-x-full group-hover:animate-shimmer" />
  Arsenal
</button>
```

### Tarjeta de Producto (Elite Spec)
* **Aspect Ratio:** `aspect-square` para imágenes consistentes.
* **Text Control:** `line-clamp-2` con tipografía `font-display` para títulos.
* **Badges Tácticos:** Etiquetas `Elite` y `Oferta` con resplandor propio.
* **Quick Buy:** Botón de acción inmediata integrado en la base.

---

## 🏗️ 3. Catálogo de Componentes de Alta Fidelidad

### A. Explorador Táctico (Catalog)
Sistema de filtrado y búsqueda de alta densidad.
* **Sidebar Glass:** Fondo `backdrop-blur-3xl` con scroll interno táctico.
* **Búsqueda Dinámica:** Input con feedback visual de foco en `primary`.
* **Sorting Engine:** Selector de orden inteligente (Precio, Recomendados).
* **Grid Staggered:** Animaciones de entrada escalonadas (`animate-in fade-in zoom-in-95`).

### B. Dashboard "Centro de Comando" (Bento Grid)
La gestión de usuario utiliza un layout asimétrico para jerarquizar la información técnica.
* **Timeline de Pedidos:** Tracking visual animado: *Recibido → Procesando → Enviado → Entregado*.

### C. Skeletons Premium (Carga Percibida)
* **Animación:** Pulso de `3s` (`duration-3000`).
* **Máscara Shimmer:** Gradiente diagonal que simula escaneo de hardware.

### D. Renderizado Seguro (Empty States)
* **Arsenal Vacío:** Feedback inmersivo cuando el carrito está en 0.
* **Centro de Comando Desconectado:** Pantalla blindada para usuarios sin sesión.

---

## 🚫 Anti-Patrones Estrictos (Zero Tolerance)
- ❌ **Spinners:** Prohibido el uso de spinners circulares; usar Skeletons.
- ❌ **Flat Colors:** No usar colores sólidos; todo debe tener textura de cristal o gradiente.
- ❌ **Layout Shifts:** Todas las imágenes y tarjetas deben tener `aspect-ratio` definido.
- ❌ **No-Feedback:** Elementos interactivos sin `:hover` o `:active` están prohibidos.
