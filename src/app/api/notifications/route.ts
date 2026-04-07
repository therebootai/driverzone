import connectToDatabase from "@/db/connection";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get("recipientId");

    if (!recipientId || !isValidObjectId(recipientId)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient ID" },
        { status: 400 },
      );
    }

    const notifications = await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const { notificationId, isRead } = await req.json();

    if (!notificationId || !isValidObjectId(notificationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification ID" },
        { status: 400 },
      );
    }

    const updated = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead },
      { new: true },
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("UPDATE NOTIFICATION ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
