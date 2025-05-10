import { type NextRequest, NextResponse } from "next/server"
import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: NextRequest, { params }: { params: { badgeName: string } }) {
  try {
    const badgeName = decodeURIComponent(params.badgeName)

    // Get badge color from query params or use default
    const searchParams = request.nextUrl.searchParams
    const color = searchParams.get("color") || "blue"

    // Generate the badge image
    const imageResponse = new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          padding: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            backgroundColor: "#f8f9fa",
            padding: 40,
            width: "90%",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: getColorHex(color),
              borderRadius: "50%",
              padding: 30,
              marginBottom: 20,
            }}
          >
            {/* Trophy icon */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: "bold",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            {badgeName}
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#666",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Achievement unlocked in Rose Finance
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f1f5f9",
              borderRadius: 10,
              padding: "10px 20px",
            }}
          >
            <div
              style={{
                fontSize: 16,
                color: "#334155",
              }}
            >
              rosefinance.app
            </div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )

    return imageResponse
  } catch (error) {
    console.error("Error generating badge image:", error)
    return NextResponse.json({ error: "Failed to generate badge image" }, { status: 500 })
  }
}

// Helper function to get color hex code
function getColorHex(color: string): string {
  switch (color.toLowerCase()) {
    case "blue":
      return "#3b82f6"
    case "green":
      return "#10b981"
    case "red":
      return "#ef4444"
    case "purple":
      return "#8b5cf6"
    case "amber":
      return "#f59e0b"
    case "emerald":
      return "#10b981"
    case "indigo":
      return "#6366f1"
    case "teal":
      return "#14b8a6"
    default:
      return "#3b82f6" // Default to blue
  }
}
