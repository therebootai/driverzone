import Users from "@/models/Users";
import jwt from "jsonwebtoken";

export function generateToken(payload: any): string | null {
  try {
    if (!process.env.SECRET_KEY) throw new Error("SECRET_KEY is missing");

    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "30d" });
  } catch (err) {
    console.error(
      "Token generation error:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

export const verifyToken = async (token: string) => {
  try {
    if (!process.env.SECRET_KEY) throw new Error("SECRET_KEY is missing");
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const userId = (decoded as { userId: string }).userId;
    const user = await Users.findById(userId).select("-password").lean();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (err) {
    console.error(
      "Invalid or expired token:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
};
