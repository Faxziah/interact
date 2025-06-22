import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"

const translateSchema = z.object({
  text: z.string().min(1).max(5000),
  fromLanguage: z.string().optional(),
  toLanguage: z.string().min(2).max(10),
  style: z.enum(["formal", "casual", "technical", "creative"]).default("formal"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = translateSchema.parse(body)
    let { text, fromLanguage, toLanguage, style } = validatedData

    // Get user settings to apply defaults
    try {
      const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/settings`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
      
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json()
        
        // Apply defaults if not provided
        if (!fromLanguage && settings.defaultSourceLanguage) {
          fromLanguage = settings.defaultSourceLanguage
        }
        if (!toLanguage && settings.defaultTargetLanguage) {
          toLanguage = settings.defaultTargetLanguage
        }
        if (style === "formal" && settings.defaultTranslationStyle) {
          style = settings.defaultTranslationStyle
        }
      }
    } catch (settingsError) {
      console.warn("Could not fetch user settings, using provided values:", settingsError)
    }

    const stylePrompts = {
      formal: "Translate the following text in a formal, professional tone.",
      casual: "Translate the following text in a casual, conversational tone.",
      technical: "Translate the following text maintaining technical accuracy and terminology.",
      creative: "Translate the following text in a creative, expressive way while maintaining meaning.",
    }

    const systemPrompt = `You are a professional translator. ${stylePrompts[style]}
    ${fromLanguage && fromLanguage !== 'auto' ? `The source language is ${fromLanguage}.` : "Detect the source language automatically."}
    The target language is ${toLanguage}.
    Provide only the translation without any additional commentary or explanation.
    Maintain the original formatting and structure of the text.`

    let translatedText: string
    try {
      console.log("Attempting to get translation from AI service...")
      const result = await generateText({
        model: groq("llama3-70b-8192"),
        system: systemPrompt,
        prompt: text,
        maxTokens: 2000,
        temperature: style === "creative" ? 0.7 : 0.3,
      })

      console.log('result', result)
      translatedText = result.text
      console.log("Successfully got translation from AI service.")
    } catch (aiError) {
      console.error("Error calling AI service:", aiError)
      throw aiError // Re-throw to be caught by the main handler
    }

    // Save translation to our backend
    try {
      console.log("Attempting to save translation to backend...")
      const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/translations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          originalText: text,
          translatedText,
          sourceLanguage: fromLanguage || "auto",
          targetLanguage: toLanguage,
          style,
        }),
      })

      if (!saveResponse.ok) {
        console.error("Backend failed to save translation. Status:", saveResponse.status)
      }
    } catch (saveError) {
      console.error("Error saving translation to backend:", saveError)
    }

    return NextResponse.json({
      translatedText,
      fromLanguage: fromLanguage || "auto",
      toLanguage,
      style,
    })
  } catch (error) {
    console.error("Error in /api/translate handler:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
