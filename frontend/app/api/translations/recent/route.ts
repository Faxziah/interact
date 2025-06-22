import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user ID
    const { data: userData } = await supabase.from("users").select("id").eq("email", session.user.email).single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get recent translations
    const { data: translations, error } = await supabase
      .from("translations")
      .select("*")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    return NextResponse.json({
      translations: translations.map((t) => ({
        id: t.id,
        originalText: t.original_text,
        translatedText: t.translated_text,
        fromLanguage: t.from_language,
        toLanguage: t.to_language,
        style: t.style,
        createdAt: t.created_at,
      })),
    })
  } catch (error) {
    console.error("Error fetching translations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
