import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { queryOne, execute, table } from "@/lib/db";
import { createAuditLog } from "@/lib/repositories";
import { getClientIP, getUserAgent } from "@/lib/audit";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Credenciales requeridas" }, { status: 400 });
    }

    const user = await queryOne<{
      id: string;
      email: string;
      name: string;
      password: string;
      role: string;
    }>(
      `SELECT id, email, name, password, role FROM ${table("users")} WHERE email = $1`,
      [email]
    );

    if (!user || !user.password) {
      await createAuditLog({
        action: "FAILED_LOGIN",
        entity: "User",
        userEmail: email,
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        error: "Email no encontrado",
      });
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      await createAuditLog({
        action: "FAILED_LOGIN",
        entity: "User",
        entityId: user.id,
        userEmail: email,
        userId: user.id,
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        error: "Contraseña incorrecta",
      });
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Invalidate any existing unused OTPs for this user
    await execute(
      `UPDATE ${table("otp_codes")} SET used = TRUE WHERE user_id = $1 AND used = FALSE`,
      [user.id]
    );

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await execute(
      `INSERT INTO ${table("otp_codes")} (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)`,
      [user.id, user.email, code, expiresAt.toISOString()]
    );

    await createAuditLog({
      action: "OTP_GENERATED",
      entity: "User",
      entityId: user.id,
      userId: user.id,
      userEmail: user.email,
      ipAddress: ip,
      userAgent,
      status: "SUCCESS",
    });

    // In production this code would be sent via email/SMS.
    // For demo purposes we return it directly so it can be displayed.
    return NextResponse.json({
      pending: true,
      email: user.email,
      otpCode: code, // DEMO ONLY — remove in production
      message: "Código OTP generado. Verifique su correo electrónico.",
    });
  } catch (error) {
    console.error("initiate-login error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
