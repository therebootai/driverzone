import Customers from "@/models/Customers";
import Drivers from "@/models/Drivers";
import Users from "@/models/Users";
import Booking from "@/models/Booking";
import jwt from "jsonwebtoken";

export function generateToken(payload: any): string | null {
  try {
    if (!process.env.SECRET_KEY) throw new Error("SECRET_KEY is missing");

    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "30d" });
  } catch (err) {
    console.error(
      "Token generation error:",
      err instanceof Error ? err.message : err,
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
  } catch (err: any) {
    if (err.message !== "User not found") {
      console.error(
        "Invalid or expired token:",
        err instanceof Error ? err.message : err,
      );
    }
    return null;
  }
};

export const verifyCustomerToken = async (token: string) => {
  try {
    if (!process.env.SECRET_KEY) throw new Error("SECRET_KEY is missing");
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = (decoded as { userId: string }).userId;
    const user = await Customers.findById(userId).select("-password").lean();
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (err: any) {
    if (err.message !== "User not found") {
      console.error(
        "Invalid or expired token:",
        err instanceof Error ? err.message : err,
      );
    }
    return null;
  }
};

export const verifyDriverToken = async (token: string) => {
  try {
    if (!process.env.SECRET_KEY) throw new Error("SECRET_KEY is missing");
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = (decoded as { userId: string }).userId;
    //@ts-ignore
    const user = await Drivers.findById(userId)
      .select("-password")
      .populate({
        path: "currentBooking",
        populate: {
          path: "customerDetails",
          select: "name mobile_number email profile_picture",
        },
      })
      .lean();
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (err: any) {
    if (err.message !== "User not found") {
      console.error(
        "Invalid or expired token:",
        err instanceof Error ? err.message : err,
      );
    }
    return null;
  }
};
