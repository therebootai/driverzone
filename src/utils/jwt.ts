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
    if (!user.status) {
      throw new Error("Account is deactivated");
    }

    return user;
  } catch (err: any) {
    if (err.message !== "User not found" && err.message !== "Account is deactivated") {
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
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = (decoded as { userId: string }).userId;
    const user = await Customers.findById(userId).select("-password").lean();
    if (!user) throw new Error("User not found");
    if (!user.status) throw new Error("Account is deactivated");
    return user;
  } catch (err: any) {
    return null;
  }
};

export const verifyDriverToken = async (token: string) => {
  try {
    if (!process.env.SECRET_KEY) throw new Error("SECRET_KEY is missing");
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = (decoded as { userId: string }).userId;
    const user = await Drivers.findById(userId).select("-password").lean();
    if (!user) throw new Error("User not found");
    if (!user.status) throw new Error("Account is deactivated");
    return user;
  } catch (err: any) {
    return null;
  }
};

/**
 * Verifies a token and checks both Customer and Driver collections.
 * Decodes the token only once for better performance.
 */
export const verifyAnyToken = async (token: string) => {
  try {
    if (!process.env.SECRET_KEY) throw new Error("SECRET_KEY is missing");
    const decoded = jwt.verify(token, process.env.SECRET_KEY) as { userId: string };
    const userId = decoded.userId;

    // Try finding in both collections in parallel
    const [customer, driver] = await Promise.all([
      Customers.findById(userId).select("-password").lean(),
      Drivers.findById(userId).select("-password").lean()
    ]);

    if (customer && !customer.status) {
      return { user: null, role: null };
    }
    if (driver && !driver.status) {
      return { user: null, role: null };
    }
    return {
      user: customer || driver || null,
      role: customer ? 'customer' : driver ? 'driver' : null
    };
  } catch (err: any) {
    return { user: null, role: null };
  }
};

