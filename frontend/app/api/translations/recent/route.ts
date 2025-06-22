import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/translations/recent`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error("Error fetching recent translations from backend:", errorData);
      return NextResponse.json({ error: "Failed to fetch recent translations" }, { status: apiResponse.status });
    }

    const translations = await apiResponse.json();

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Error fetching translations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
