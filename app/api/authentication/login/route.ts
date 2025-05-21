import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await db.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (email !== user.email || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        { message: "Email not verified" },
        { status: 403 }
      );
    }

    const token = signToken({ email });

    // Set cookie using the new cookies() API
    const cookieStore = cookies();
    (await cookieStore).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * (24 * 7), // 7 days
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({
      message: "Logged in",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
