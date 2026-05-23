import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      authenticated: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      } : null,
    });
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
      stack: (error as Error).stack,
    }, { status: 500 });
  }
}