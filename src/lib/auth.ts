import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export const registerUser = async (
    username: string, email: string, password: string, healthIssues: string[]
) => {
    try {
        await connectDB();
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { error: "Email already in use" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, healthIssues });
        await user.save();

        return { message: "User registered successfully", user };
    } catch (error) {
        console.error("Register Error:", error);
        return { error: "Registration failed" };
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        await connectDB();
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found"); // ❌ Don't return an object, throw an error
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials"); // ❌ Throw an error instead of returning an object
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        return token; // ✅ Return only the token, not an object
    } catch (error) {
        console.error("Login Error:", error);
        throw new Error("Login failed"); // ❌ Don't return an object, throw an error
    }
};
