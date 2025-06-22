"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Languages, History, Settings, LogOut, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface Language {
  id: string
  code: string
  name: string
  nativeName: string
}

interface TranslationStyleType {
  id: string
  value: string
  label: string
  description?: string
}

interface TranslationResult {
  id: string
  originalText: string
  translatedText: string
  fromLanguage: string
  toLanguage: string
  style: string
  createdAt: string
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [fromLanguage, setFromLanguage] = useState("auto")
  const [toLanguage, setToLanguage] = useState("en")
  const [translationStyle, setTranslationStyle] = useState("formal")
  const [isTranslating, setIsTranslating] = useState(false)
  const [recentTranslations, setRecentTranslations] = useState<TranslationResult[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [translationStyles, setTranslationStyles] = useState<TranslationStyleType[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchLanguages(),
        fetchTranslationStyles(),
        session ? fetchRecentTranslations() : Promise.resolve()
      ])
      setIsLoadingData(false)
    }
    
    loadInitialData()
  }, [session])

  const fetchLanguages = async () => {
    try {
      const response = await fetch("/api/languages")
      if (response.ok) {
        const data = await response.json()
        setLanguages(data)
      }
    } catch (error) {
      console.error("Failed to fetch languages:", error)
    }
  }

  const fetchTranslationStyles = async () => {
    try {
      const response = await fetch("/api/translation-styles")
      if (response.ok) {
        const data = await response.json()
        setTranslationStyles(data)
      }
    } catch (error) {
      console.error("Failed to fetch translation styles:", error)
    }
  }

  const fetchRecentTranslations = async () => {
    try {
      const response = await fetch("/api/translations/recent")
      if (response.ok) {
        const data = await response.json()
        setRecentTranslations(data.translations)
      }
    } catch (error) {
      console.error("Failed to fetch recent translations:", error)
    }
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate",
        variant: "destructive",
      })
      return
    }

    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the translation service",
        variant: "destructive",
      })
      return
    }

    setIsTranslating(true)
    setTranslatedText("")

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          fromLanguage: fromLanguage === "auto" ? undefined : fromLanguage,
          toLanguage,
          style: translationStyle,
        }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const data = await response.json()
      setTranslatedText(data.translatedText)

      // Refresh recent translations
      fetchRecentTranslations()

      toast({
        title: "Success",
        description: "Text translated successfully!",
      })
    } catch (error) {
      console.error("Translation error:", error)
      toast({
        title: "Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const handleClearAll = () => {
    setInputText("")
    setTranslatedText("")
  }

  if (status === "loading" || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Languages className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Interact</h1>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/history">
                  <Button variant="ghost" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm text-gray-600">{session.user?.email}</span>
                </div>
                <Button onClick={() => signOut()} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => signIn()} variant="default">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Translation Interface */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Languages className="h-5 w-5" />
                <span>AI-Powered Translation</span>
              </CardTitle>
              <CardDescription>
                Translate text between languages with AI-powered accuracy and style customization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language and Style Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From Language</label>
                  <Select value={fromLanguage} onValueChange={setFromLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                                          <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        {languages.map((lang: Language) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">To Language</label>
                  <Select value={toLanguage} onValueChange={setToLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                                          <SelectContent>
                        {languages.map((lang: Language) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Translation Style</label>
                  <Select value={translationStyle} onValueChange={setTranslationStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                                          <SelectContent>
                        {translationStyles.map((style: TranslationStyleType) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Translation Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Original Text</label>
                  <Textarea
                    placeholder="Enter text to translate..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] resize-none"
                    maxLength={5000}
                  />
                  <div className="text-xs text-gray-500 mt-1">{inputText.length}/5000 characters</div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Translation</label>
                  <div className="relative">
                    <Textarea
                      placeholder="Translation will appear here..."
                      value={translatedText}
                      readOnly
                      className="min-h-[200px] resize-none bg-gray-50"
                    />
                    {isTranslating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleTranslate} disabled={isTranslating || !session} className="flex-1 sm:flex-none">
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    "Translate"
                  )}
                </Button>
                <Button variant="outline" onClick={handleClearAll} disabled={isTranslating}>
                  Clear All
                </Button>
              </div>

              {!session && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Sign in required:</strong> Please sign in to use the translation service and save your
                    translation history.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Translations */}
          {session && recentTranslations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Recent Translations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTranslations.slice(0, 3).map((translation) => (
                    <div key={translation.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            {languages.find((l: Language) => l.code === translation.fromLanguage)?.name ||
                              translation.fromLanguage}
                            →{languages.find((l: Language) => l.code === translation.toLanguage)?.name || translation.toLanguage}
                          </Badge>
                          <Badge variant="outline">{translation.style}</Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(translation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Original:</p>
                          <p className="text-gray-600">{translation.originalText.substring(0, 100)}...</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Translation:</p>
                          <p className="text-gray-600">{translation.translatedText.substring(0, 100)}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {recentTranslations.length > 3 && (
                  <div className="mt-4 text-center">
                    <Link href="/history">
                      <Button variant="outline">View All Translations</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
