# Brand Specification: TechStorePro

## Visual Direction: Liquid Glass / Luxury Modern
An immersive, high-fidelity experience combining deep cosmic backgrounds with translucent glass surfaces and vibrant neon accents.

## Color Tokens (OKLch)
Converted from existing hex values for precision and perceptually uniform transitions.

| Token | Role | Original Hex | OKLch Value |
|-------|------|--------------|-------------|
| `--bg` | Background | `#0F0F23` | `oklch(15% 0.02 260)` |
| `--surface` | Glass Surface | `rgba(255,255,255,0.05)` | `oklch(100% 0 0 / 0.05)` |
| `--fg` | Foreground Text | `#E2E8F0` | `oklch(92% 0.01 250)` |
| `--muted` | Secondary Text | `#A78BFA` | `oklch(70% 0.15 270)` |
| `--border` | Glass Border | `rgba(255,255,255,0.1)` | `oklch(100% 0 0 / 0.1)` |
| `--accent` | Primary Action | `#7C3AED` | `oklch(52% 0.25 285)` |
| `--cta` | Call to Action | `#F43F5E` | `oklch(62% 0.22 15)` |

## Typography
- **Display Font:** `Montserrat` (Bold, tracking-tight)
- **Body Font:** `Inter` (Standard, readable)
- **Mood:** Premium, refined, software-native.

## Layout & Posture Rules
1. **Bento Grid Posture:** Large radii (`24px`), generous spacing (`1.5rem` gaps).
2. **Glassmorphism:** All cards must use `.glass` utility (blur 12px, subtle border).
3. **Interactive States:** 
   - Hover: `translateY(-2px)`, scale `1.02`, increased blur or opacity.
   - Transitions: `300ms` curves for "Liquid" feel.
4. **Anti-Patterns:**
   - No sharp corners (minimum `8px` for buttons, `24px` for cards).
   - No solid grey backgrounds; use translucent overlays.
   - No emojis for iconography (use Lucide/Heroicons).
