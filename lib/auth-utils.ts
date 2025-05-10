import { cookies } from "next/headers"

export async function getCurrentUser() {
  try {
    const session = cookies().get("session")?.value

    if (!session) {
      // For development purposes, return a mock user
      // In production, you would return null here
      return {
        uid: "mock-user-id",
        email: "user@example.com",
        displayName: "Demo User",
      }
    }

    // In a real implementation, you would verify the session with Firebase Admin
    // For now, return a mock user
    return {
      uid: "mock-user-id",
      email: "user@example.com",
      displayName: "Demo User",
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
