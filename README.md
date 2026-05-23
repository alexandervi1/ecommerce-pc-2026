# KelectronicaEC — Ecommerce de Hardware de Alto Rendimiento

Plataforma de comercio electrónico premium para entusiastas del hardware en Ecuador. Desarrollada como proyecto académico en la ESPOCH (Escuela Superior Politécnica de Chimborazo) — Ingeniería en Sistemas.

---

## Características principales

- Catálogo de productos y componentes con filtros avanzados
- Configurador de PC con validación de compatibilidad en tiempo real
- Carrito, wishlist y gestión de pedidos
- Panel de administración (productos, órdenes, usuarios, analíticas)
- Panel de auditoría con trazabilidad completa de acciones
- **Módulo de seguridad completo** (ver sección dedicada)

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

---

## Módulo de Seguridad — Grupo 1 (ESPOCH SI)

Implementa un sistema de autenticación robusto que supera el modelo tradicional de usuario y contraseña.

### 1. Gestión de Credenciales

Las contraseñas deben cumplir **todas** las siguientes reglas (validadas en frontend y backend):

| Regla | Detalle |
|-------|---------|
| Longitud mínima | 8 caracteres |
| Mayúscula | Al menos una letra A–Z |
| Minúscula | Al menos una letra a–z |
| Número | Al menos un dígito 0–9 |
| Carácter especial | Al menos uno de `!@#$%^&*()_+-=[]{}...` |

**Archivos clave:**
- `src/lib/schemas.ts` — `PASSWORD_RULES` y `registerSchema`
- `src/app/api/auth/register/route.ts` — validación server-side

---

### 2. Doble Factor de Autenticación (2FA / OTP)

Flujo completo en dos pasos:

```
[Login] → /api/auth/initiate-login
         ↓ verifica credenciales
         ↓ genera OTP de 6 dígitos (TTL: 5 min)
         ↓ guarda en auth.otp_codes
         ↓ retorna código (DEMO) / enviaría por correo (PROD)
         
[/verify-2fa] → usuario ingresa OTP
              → /api/auth/verify-otp
              ↓ valida código
              ↓ emite token de un solo uso (TTL: 60s) en auth.otp_tokens
              ↓ cliente llama signIn("credentials", { email, otpToken })
              ↓ authorize() consume el token y crea sesión JWT completa
```

> **Modo demo:** el código OTP se muestra en pantalla en un banner amarillo. En producción se enviaría al correo/móvil del usuario.

**Archivos clave:**
- `src/app/api/auth/initiate-login/route.ts`
- `src/app/api/auth/verify-otp/route.ts`
- `src/app/verify-2fa/` — página con inputs de 6 dígitos + countdown
- `src/lib/auth.ts` — `authorize()` con Path A (OTP token) y Path B (password)

---

### 3. Control de Concurrencia (Acceso Único)

El sistema impide sesiones simultáneas del mismo usuario:

- La tabla `auth.users` tiene una columna `session_version` (entero).
- En cada nuevo login exitoso, `session_version` se incrementa en la BD.
- El JWT contiene el valor de `sessionVersion` en el momento del login.
- Cualquier API route protegido llama a `guardSession()`:
  - Si `JWT.sessionVersion !== DB.session_version` → responde `401` con código `SESSION_REPLACED`.
  - El frontend puede interpretar este código para mostrar: *"Tu sesión fue cerrada porque iniciaste sesión desde otro dispositivo."*

**Archivos clave:**
- `src/lib/session-guard.ts` — función `guardSession()`
- `src/lib/auth.ts` — incremento de `session_version` en `authorize()`
- `src/types/next-auth.d.ts` — tipos extendidos con `sessionVersion`

---

### 4. Tokens con Caducidad

| Parámetro | Valor |
|-----------|-------|
| Vida del token JWT | 30 minutos |
| Renovación automática | Cada 5 minutos de actividad |
| OTP | 5 minutos |
| Token de intercambio OTP | 60 segundos |

Configurado en `src/lib/auth.ts` mediante `session.maxAge` y `session.updateAge`.

---

## Esquema de Base de Datos

```
auth
├── users             (id, email, name, password, role, session_version)
├── accounts          (OAuth providers)
├── sessions
├── verification_tokens
├── auditor_credentials
├── otp_codes         (id, user_id, email, code, expires_at, used)  ← NUEVO
└── otp_tokens        (id, user_id, token, expires_at)              ← NUEVO

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
git clone https://github.com/TU_USUARIO/ecommerce-pc.git
cd ecommerce-pc
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Crea un archivo `.env` en la raíz:

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

# Ejecutar migración del módulo de seguridad
npx tsx scripts/security-module-migration.ts

# Crear usuarios de prueba
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

> Estas cuentas son pre-existentes en la BD seed. Las nuevas cuentas creadas vía registro deben cumplir la política de contraseñas fuerte.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/    ← NextAuth handler
│   │   │   ├── initiate-login/   ← Paso 1 del login (2FA)
│   │   │   ├── verify-otp/       ← Validación OTP
│   │   │   └── register/         ← Registro con política de contraseña
│   │   ├── admin/                ← CRUD admin (requiere rol ADMIN)
│   │   ├── profile/              ← Perfil de usuario
│   │   └── ...
│   ├── login/                    ← Página de inicio de sesión
│   ├── verify-2fa/               ← Página de verificación OTP
│   ├── register/
│   ├── admin/
│   ├── auditor/
│   └── account/
├── lib/
│   ├── auth.ts                   ← Configuración NextAuth
│   ├── db.ts                     ← Pool PostgreSQL + helpers
│   ├── schemas.ts                ← Zod schemas + PASSWORD_RULES
│   ├── session-guard.ts          ← guardSession() para concurrencia
│   ├── repositories.ts           ← Data access layer
│   └── audit.ts                  ← Logging de auditoría
├── middleware.ts                  ← Protección de rutas
└── types/
    └── next-auth.d.ts            ← Tipos extendidos (sessionVersion)
```

---

## Scripts útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # Linter

npx tsx scripts/security-module-migration.ts  # Migración módulo seguridad
npx tsx scripts/setup-users.ts               # Crear usuarios seed
npx tsx scripts/list-users.ts                # Ver usuarios en BD
```

---

## Autores

Desarrollado como proyecto académico en la **ESPOCH — Ingeniería en Sistemas**.

© 2026 KelectronicaEC.
