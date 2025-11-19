import { NextRequest, NextResponse } from "next/server";
import { createCustomer } from "@/actions/customerActions"; 
import connectToDataBase from "@/db/connection";



export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await createCustomer(data);

    if (result.success) {
      return NextResponse.json(result.customer, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    await connectToDataBase();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}