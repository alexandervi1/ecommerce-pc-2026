import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getUserByEmail, createUser, createAuditLog } from "@/lib/repositories";
import { PASSWORD_RULES } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    if (password.length < PASSWORD_RULES.min) {
      return NextResponse.json({ error: `La contraseña debe tener al menos ${PASSWORD_RULES.min} caracteres` }, { status: 400 });
    }
    if (!PASSWORD_RULES.uppercase.test(password)) {
      return NextResponse.json({ error: "La contraseña debe contener al menos una mayúscula" }, { status: 400 });
    }
    if (!PASSWORD_RULES.lowercase.test(password)) {
      return NextResponse.json({ error: "La contraseña debe contener al menos una minúscula" }, { status: 400 });
    }
    if (!PASSWORD_RULES.number.test(password)) {
      return NextResponse.json({ error: "La contraseña debe contener al menos un número" }, { status: 400 });
    }
    if (!PASSWORD_RULES.special.test(password)) {
      return NextResponse.json({ error: "La contraseña debe contener al menos un carácter especial (!@#$%^&*...)" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);
    const userId = await createUser({ name, email, password: hashedPassword });

    await createAuditLog({
      action: "CREATE",
      entity: "User",
      entityId: userId,
      newValue: { id: userId, email, name },
      userId,
      userEmail: email,
      status: "SUCCESS",
    });

    return NextResponse.json(
      { message: "Usuario creado exitosamente", userId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    await createAuditLog({
      action: "REGISTER",
      entity: "User",
      error: error instanceof Error ? error.message : "Unknown error",
      status: "ERROR",
    });
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
