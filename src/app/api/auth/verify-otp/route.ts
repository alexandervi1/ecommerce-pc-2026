import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { queryOne, execute, table } from "@/lib/db";
import { createAuditLog } from "@/lib/repositories";
import { getClientIP, getUserAgent } from "@/lib/audit";

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);

  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
    }

    const otpRecord = await queryOne<{
      id: string;
      user_id: string;
      code: string;
      expires_at: string;
    }>(
      `SELECT id, user_id, code, expires_at
       FROM ${table("otp_codes")}
       WHERE email = $1 AND used = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [email]
    );

    if (!otpRecord) {
      await createAuditLog({
        action: "OTP_FAILED",
        entity: "User",
        userEmail: email,
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        error: "Código OTP inválido o expirado",
      });
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 401 });
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      await createAuditLog({
        action: "OTP_FAILED",
        entity: "User",
        entityId: otpRecord.user_id,
        userEmail: email,
        userId: otpRecord.user_id,
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        error: "Código OTP expirado",
      });
      return NextResponse.json({ error: "El código OTP ha expirado" }, { status: 401 });
    }

    if (otpRecord.code !== code.trim()) {
      await createAuditLog({
        action: "OTP_FAILED",
        entity: "User",
        entityId: otpRecord.user_id,
        userEmail: email,
        userId: otpRecord.user_id,
        ipAddress: ip,
        userAgent,
        status: "FAILED",
        error: "Código OTP incorrecto",
      });
      return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
    }

    // Mark OTP as used
    await execute(
      `UPDATE ${table("otp_codes")} SET used = TRUE WHERE id = $1`,
      [otpRecord.id]
    );

    // Issue a short-lived one-time token so the client can call signIn
    const oneTimeToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds

    await execute(
      `INSERT INTO ${table("otp_tokens")} (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [otpRecord.user_id, oneTimeToken, expiresAt.toISOString()]
    );

    await createAuditLog({
      action: "OTP_VERIFIED",
      entity: "User",
      entityId: otpRecord.user_id,
      userId: otpRecord.user_id,
      userEmail: email,
      ipAddress: ip,
      userAgent,
      status: "SUCCESS",
    });

    return NextResponse.json({ verified: true, token: oneTimeToken });
  } catch (error) {
    console.error("verify-otp error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
