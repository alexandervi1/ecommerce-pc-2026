# KelectronicaEC — Ecommerce de Hardware de Alto Rendimiento

Plataforma de comercio electrónico premium para entusiastas del hardware en Ecuador. Desarrollada como proyecto académico en la ESPOCH (Escuela Superior Politécnica de Chimborazo) — Ingeniería en Sistemas.

---

## Características principales

- Catálogo de productos y componentes con filtros avanzados
- Configurador de PC con validación de compatibilidad en tiempo real
- Carrito, wishlist y gestión de pedidos
- Panel de administración (productos, órdenes, usuarios, analíticas)
- Panel de auditoría con trazabilidad completa de acciones
- **Módulo de seguridad completo — Grupo 1** (ver sección dedicada)

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19, TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Base de datos | PostgreSQL (multi-esquema) |
| Auth | NextAuth v5 (JWT strategy) |
| Pagos | Stripe |
| Validación | Zod + React Hook Form |
| Hashing | bcryptjs (12 rounds) |
| UUID | uuid v13 |

---

## Módulo de Seguridad — Grupo 1 (ESPOCH SI)

Implementa un sistema de autenticación robusto que supera el modelo tradicional de usuario y contraseña. Todos los requerimientos fueron verificados en tiempo de ejecución.

---

### 1. Gestión de Credenciales

Las contraseñas deben cumplir **todas** las siguientes reglas. La validación ocurre en el frontend (Zod + React Hook Form) **y** en el backend (API route), de forma independiente.

| Regla | Detalle |
|-------|---------|
| Longitud mínima | 8 caracteres |
| Mayúscula | Al menos una letra A–Z |
| Minúscula | Al menos una letra a–z |
| Número | Al menos un dígito 0–9 |
| Carácter especial | Al menos uno de `!@#$%^&*()_+-=[]{}...` |

Cada regla devuelve un mensaje de error específico. Ejemplo:

```
POST /api/auth/register  { password: "Password1" }
→ 400 { "error": "La contraseña debe contener al menos un carácter especial" }
```

**Archivos clave:**
- `src/lib/schemas.ts` — exporta `PASSWORD_RULES` y `registerSchema`
- `src/app/api/auth/register/route.ts` — validación server-side

---

### 2. Doble Factor de Autenticación (2FA / OTP)

El login ocurre en **dos pasos obligatorios**. Las credenciales correctas no crean sesión directamente — solo generan un OTP.

```
Paso 1 — Verificar credenciales
POST /api/auth/initiate-login  { email, password }
  ↓ verifica email + password contra la BD
  ↓ genera código OTP de 6 dígitos
  ↓ guarda en auth.otp_codes con TTL de 5 minutos
  ↓ retorna el código en modo demo (en producción se enviaría por correo/SMS)

Paso 2 — Verificar OTP
POST /api/auth/verify-otp  { email, code }
  ↓ valida el código (error si incorrecto o expirado)
  ↓ marca el OTP como usado (no reutilizable)
  ↓ emite un token de un solo uso con TTL de 60 segundos

Paso 3 — Crear sesión
signIn("credentials", { email, otpToken })
  ↓ authorize() valida y consume el token de un solo uso
  ↓ incrementa session_version del usuario
  ↓ crea el JWT de sesión completo
```

> **Modo demo:** el código OTP se muestra en un banner amarillo en `/verify-2fa`. En producción se eliminaría esa línea y el código solo llegaría al correo/móvil del usuario.

**Archivos clave:**
- `src/app/api/auth/initiate-login/route.ts`
- `src/app/api/auth/verify-otp/route.ts`
- `src/app/verify-2fa/` — página con inputs de 6 dígitos + countdown de 5 min
- `src/lib/auth.ts` — `authorize()` maneja Path A (otpToken) y Path B (password directo)

---

### 3. Control de Concurrencia (Acceso Único)

El sistema garantiza que el mismo usuario no pueda tener dos sesiones activas simultáneamente.

**Mecanismo:**
- La tabla `auth.users` tiene una columna `session_version` (entero, por defecto 1).
- En cada nuevo login exitoso, `session_version` se incrementa en la BD.
- El JWT incluye `sessionVersion` con el valor en el momento del login.
- Los API routes protegidos llaman a `guardSession()` antes de procesar la solicitud:
  - Compara `JWT.sessionVersion` con `DB.session_version`.
  - Si no coinciden → `401` con `code: "SESSION_REPLACED"`.

**Resultado:** cuando el usuario abre sesión en un segundo dispositivo, la primera sesión queda inválida en la próxima petición que haga al servidor.

**Archivos clave:**
- `src/lib/session-guard.ts` — función `guardSession()`
- `src/lib/auth.ts` — incremento de `session_version` en `authorize()`
- `src/types/next-auth.d.ts` — tipos extendidos con `sessionVersion`

---

### 4. Tokens con Caducidad

| Token | Duración |
|-------|----------|
| Sesión JWT | 30 minutos |
| Renovación automática del JWT | Cada 5 minutos de actividad |
| Código OTP | 5 minutos |
| Token de intercambio OTP | 60 segundos |

Configurado en `src/lib/auth.ts` mediante `session.maxAge` y `session.updateAge`.

---

### Verificación del módulo (pruebas en ejecución)

| Caso | Resultado |
|------|-----------|
| Login con contraseña incorrecta | `401 Credenciales inválidas` |
| Login correcto | `200` + OTP generado |
| OTP incorrecto | `401 Código incorrecto` |
| OTP correcto | `200` + token de un solo uso |
| Reusar OTP ya consumido | `401 Código inválido o expirado` |
| Contraseña sin carácter especial | `400` con mensaje específico |
| Contraseña sin número | `400` con mensaje específico |
| Contraseña sin mayúscula | `400` con mensaje específico |
| Contraseña completa válida | `201 Usuario creado` |
| `/account` sin sesión | `307 → /login?callbackUrl=/account` |
| `/api/profile` sin sesión | `401 No autenticado` |
| `/admin` sin sesión | `307 → /login?callbackUrl=/admin` |

---

## Esquema de Base de Datos

```
auth
├── users               (id, email, name, password, role, session_version)
├── accounts            (OAuth providers)
├── sessions
├── verification_tokens
├── auditor_credentials
├── otp_codes           (id, user_id, email, code, expires_at, used)   ← módulo seguridad
└── otp_tokens          (id, user_id, token, expires_at)               ← módulo seguridad

products
├── categories
└── products

components
├── component_categories
├── components
└── compatibility_rules

orders
├── orders
└── order_items

cart
├── carts
└── cart_items

builds
├── pc_builds
└── pc_build_items

audit
├── audit_logs
├── error_logs
└── login_history
```

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/alexandervi1/ecommerce-pc-2026.git
cd ecommerce-pc-2026
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Crea un archivo `.env` en la raíz (basándote en `.env.example`):

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/ecommerce_pc"
AUTH_SECRET="cadena-aleatoria-larga-minimo-32-caracteres"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 4. Inicializar la base de datos

```bash
# Restaurar esquemas base
psql -U postgres -d ecommerce_pc -f "backup base_esquemas.sql"

# Ejecutar migración del módulo de seguridad (tablas OTP + session_version)
npx tsx scripts/security-module-migration.ts

# Crear usuarios de prueba (admin, cliente, auditor)
npx tsx scripts/setup-users.ts
```

### 5. Iniciar el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Cuentas de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@kelectronicaec.com | password123 |
| Cliente | cliente@kelectronicaec.com | password123 |
| Auditor | auditor@kelectronicaec.com | password123 |

> Estas cuentas son anteriores a la política de contraseñas fuerte. Las nuevas cuentas creadas vía `/register` deben cumplir todos los requisitos de complejidad.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/    ← NextAuth handler
│   │   │   ├── initiate-login/   ← Paso 1 del login (verifica credenciales + genera OTP)
│   │   │   ├── verify-otp/       ← Paso 2 del login (valida OTP + emite token)
│   │   │   └── register/         ← Registro con política de contraseña fuerte
│   │   ├── admin/                ← CRUD admin (requiere rol ADMIN)
│   │   ├── profile/              ← Perfil de usuario (protegido con guardSession)
│   │   └── ...
│   ├── login/                    ← Página de inicio de sesión
│   ├── verify-2fa/               ← Página de verificación OTP (6 dígitos + countdown)
│   ├── register/
│   ├── admin/
│   ├── auditor/
│   └── account/
├── lib/
│   ├── auth.ts                   ← Configuración NextAuth + lógica de sesión
│   ├── db.ts                     ← Pool PostgreSQL + helpers query/execute
│   ├/schemas.ts                ← Zod schemas + PASSWORD_RULES exportados
│   ├── session-guard.ts          ← guardSession() — control de concurrencia
│   ├── repositories.ts           ← Data access layer (createUser, createAuditLog, etc.)
│   └── audit.ts                  ← Logging de auditoría
├── middleware.ts                  ← Protección de rutas por cookie de sesión
└── types/
    └── next-auth.d.ts            ← Tipos extendidos (role, sessionVersion)
```

---

## Scripts útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # Linter ESLint

# Base de datos
npx tsx scripts/security-module-migration.ts  # Migración módulo seguridad
npx tsx scripts/setup-users.ts               # Crear usuarios seed
npx tsx scripts/list-users.ts                # Listar usuarios en BD
npx tsx scripts/check-db.ts                  # Verificar conexión BD
```

---

## Autores

Desarrollado como proyecto académico en la **ESPOCH — Ingeniería en Sistemas**.

© 2026 KelectronicaEC.
