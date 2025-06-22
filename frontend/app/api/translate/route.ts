import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const translateSchema = z.object({
  text: z.string().min(1).max(5000),
  fromLanguage: z.string().optional(),
  toLanguage: z.string().min(2).max(10),
  style: z.enum(["formal", "casual", "technical", "creative"]).default("formal"),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Validate request body
    const body = await request.json()
    const validatedData = translateSchema.parse(body)

    const { text, fromLanguage, toLanguage, style } = validatedData

    // Create system prompt based on style
    const stylePrompts = {
      formal: "Translate the following text in a formal, professional tone.",
      casual: "Translate the following text in a casual, conversational tone.",
      technical: "Translate the following text maintaining technical accuracy and terminology.",
      creative: "Translate the following text in a creative, expressive way while maintaining meaning.",
    }

    const systemPrompt = `You are a professional translator. ${stylePrompts[style]} 
    ${fromLanguage ? `The source language is ${fromLanguage}.` : "Detect the source language automatically."} 
    The target language is ${toLanguage}. 
    Provide only the translation without any additional commentary or explanation.
    Maintain the original formatting and structure of the text.`

    // Generate translation using AI
    const { text: translatedText } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: text,
      maxTokens: 2000,
      temperature: style === "creative" ? 0.7 : 0.3,
    })

    // Save translation to database
    const { data: userData } = await supabase.from("users").select("id").eq("email", session.user.email).single()

    if (userData) {
      await supabase.from("translations").insert({
        user_id: userData.id,
        original_text: text,
        translated_text: translatedText,
        from_language: fromLanguage || "auto",
        to_language: toLanguage,
        style: style,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      translatedText,
      fromLanguage: fromLanguage || "auto",
      toLanguage,
      style,
    })
  } catch (error) {
    console.error("Translation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
