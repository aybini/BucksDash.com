import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "API is working",
    timestamp: new Date().toISOString(),
  })
}
