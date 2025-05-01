//app/api/auth/route.ts


import { NextResponse } from "next/server";
import { registerUser, loginUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Received Request Body:", body); // ✅ Debugging Line

        const { action, username, email, password, healthIssues, allergies } = body;

        if (action === "register") {
            if (!username || !email || !password) {
                return NextResponse.json(
                    { error: "Username, email, and password are required" },
                    { status: 400 }
                );
            }

            try {
                const user = await registerUser(
                    username, 
                    email, 
                    password, 
                    healthIssues || [],
                    allergies || []
                );

                if ("error" in user) {
                    throw new Error(user.error);
                }

                return NextResponse.json({ message: "User registered", user });
            } catch (error) {
                return NextResponse.json(
                    { error: error instanceof Error ? error.message : "Registration failed" },
                    { status: 400 }
                );
            }
        } 
        
        if (action === "login") {
            console.log("Login Attempt:", email, password);

            try {
                const token = await loginUser(email, password);
                console.log("Login Token:", token);

                return NextResponse.json({ token });
            } catch (error) {
                return NextResponse.json(
                    { error: error instanceof Error ? error.message : "Login failed" },
                    { status: 401 }
                );
            }
        } 

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("POST /api/auth Error:", error);

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
