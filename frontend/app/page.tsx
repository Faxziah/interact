"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Languages, History, Settings, LogOut, User, ArrowRight, Sparkles, Copy, Volume2 } from "lucide-react"
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
        session ? fetchRecentTranslations() : Promise.resolve(),
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  if (status === "loading" || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto" />
            <div className="absolute inset-0 h-12 w-12 rounded-full bg-violet-200 animate-ping mx-auto opacity-20"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
 

      <main className="relative container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              AI-Powered Translation
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Translate text between languages with AI-powered accuracy and style customization
            </p>
          </div>

          {/* Main Translation Interface */}
          <Card className="mb-8 border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Language and Style Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-violet-500 rounded-full mr-2"></div>
                    From Language
                  </label>
                  <Select value={fromLanguage} onValueChange={setFromLanguage}>
                    <SelectTrigger className="h-12 bg-white/70 border-gray-200 hover:border-violet-300 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto" className="font-medium">
                        <div className="flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-violet-500" />
                          Auto-detect
                        </div>
                      </SelectItem>
                      {languages.map((lang: Language) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    To Language
                  </label>
                  <Select value={toLanguage} onValueChange={setToLanguage}>
                    <SelectTrigger className="h-12 bg-white/70 border-gray-200 hover:border-blue-300 transition-colors">
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
                  <div className="absolute top-8 right-12 transform translate-x-1/2">
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                    Translation Style
                  </label>
                  <Select value={translationStyle} onValueChange={setTranslationStyle}>
                    <SelectTrigger className="h-12 bg-white/70 border-gray-200 hover:border-cyan-300 transition-colors">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Original Text</label>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{inputText.length}/5000</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="Enter text to translate..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[240px] resize-none bg-white/70 border-gray-200 focus:border-violet-400 focus:ring-violet-400/20 text-base leading-relaxed"
                      maxLength={5000}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Translation</label>
                    <div className="flex items-center space-x-2">
                      {translatedText && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(translatedText)}
                          className="h-8 px-2 hover:bg-blue-100"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                      <Volume2 className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="Translation will appear here..."
                      value={translatedText}
                      readOnly
                      className="min-h-[240px] resize-none bg-gradient-to-br from-blue-50/50 to-cyan-50/50 border-gray-200 text-base leading-relaxed"
                    />
                    {isTranslating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-md">
                        <div className="text-center space-y-3">
                          <div className="relative">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto" />
                            <div className="absolute inset-0 h-8 w-8 rounded-full bg-violet-200 animate-ping mx-auto opacity-20"></div>
                          </div>
                          <p className="text-sm font-medium text-gray-600">Translating...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8 justify-center">
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !session}
                  className="px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  size="lg"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Translate
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={isTranslating}
                  className="px-6 py-3 bg-white/70 border-gray-200 hover:bg-white hover:border-gray-300 transition-colors"
                  size="lg"
                >
                  Clear All
                </Button>
              </div>

              {!session && (
                <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-1">Sign in required</h3>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        Please sign in to use the translation service and save your translation history.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Translations */}
          {session && recentTranslations.length > 0 && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <History className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl">Recent Translations</span>
                </CardTitle>
                <CardDescription className="text-base">Your latest translation history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTranslations.slice(0, 3).map((translation, index) => (
                    <div
                      key={translation.id}
                      className="group relative border border-gray-100 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-violet-200">
                            {languages.find((l: Language) => l.code === translation.fromLanguage)?.name ||
                              translation.fromLanguage}
                            <ArrowRight className="h-3 w-3 mx-1" />
                            {languages.find((l: Language) => l.code === translation.toLanguage)?.name ||
                              translation.toLanguage}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {translation.style}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(translation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-700 text-sm">Original:</p>
                          <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                            {translation.originalText.length > 120
                              ? `${translation.originalText.substring(0, 120)}...`
                              : translation.originalText}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-700 text-sm">Translation:</p>
                          <p className="text-gray-600 text-sm leading-relaxed bg-blue-50 p-3 rounded-lg">
                            {translation.translatedText.length > 120
                              ? `${translation.translatedText.substring(0, 120)}...`
                              : translation.translatedText}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {recentTranslations.length > 3 && (
                  <div className="mt-6 text-center">
                    <Link href="/history">
                      <Button
                        variant="outline"
                        className="bg-white/70 border-gray-200 hover:bg-white hover:border-gray-300 transition-colors"
                      >
                        <History className="h-4 w-4 mr-2" />
                        View All Translations
                      </Button>
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
