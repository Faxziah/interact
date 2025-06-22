"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

interface UserSettings {
  defaultModel?: string;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
  defaultTranslationStyle?: string;
  autoSaveTranslations?: boolean;
  autoDetectLanguage?: boolean;
  emailNotifications?: boolean;
}

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

const STYLES = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'technical', label: 'Technical' },
  { value: 'creative', label: 'Creative' },
];

const MODELS = [
  { value: 'groq-llama3', label: 'Groq Llama3', disabled: false },
  { value: 'openai-gpt-4', label: 'OpenAI GPT-4', disabled: true },
  { value: 'openai-gpt-3.5', label: 'OpenAI GPT-3.5', disabled: true },
];

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchSettings = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/users/settings')
          if (!response.ok) throw new Error('Failed to fetch settings')
          const data = await response.json()
          setSettings(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred')
        } finally {
          setIsLoading(false)
        }
      }
      fetchSettings()
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [status])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const {
        defaultModel,
        defaultSourceLanguage,
        defaultTargetLanguage,
        defaultTranslationStyle,
        autoSaveTranslations,
        autoDetectLanguage,
        emailNotifications,
      } = settings;

      const payload = {
        defaultModel,
        defaultSourceLanguage,
        defaultTargetLanguage,
        defaultTranslationStyle,
        autoSaveTranslations,
        autoDetectLanguage,
        emailNotifications,
      };

      const response = await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to save settings')
      toast({ title: 'Success', description: 'Settings saved successfully.' })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleSelectChange = (key: keyof UserSettings) => (value: string) => {
    setSettings(prev => ({...prev, [key]: value}))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Card>
          <CardContent className="p-6 space-y-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (status === 'unauthenticated') {
    return (
       <div className="container mx-auto px-4 py-8">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please sign in to manage your settings.</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your account and translation preferences.</p>
      <Card>
        <CardHeader>
          <CardTitle>Translation Preferences</CardTitle>
          <CardDescription>Choose your default translation options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="default-model">Default Model</Label>
            <Select value={settings.defaultModel} onValueChange={handleSelectChange('defaultModel')}>
              <SelectTrigger id="default-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map(model => (
                  <SelectItem key={model.value} value={model.value} disabled={model.disabled}>
                    {model.label}
                    {model.disabled && <span className="text-muted-foreground ml-2">(available soon)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-lang">Default Source Language</Label>
             <Select value={settings.defaultSourceLanguage} onValueChange={handleSelectChange('defaultSourceLanguage')}>
              <SelectTrigger id="source-lang">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="target-lang">Default Target Language</Label>
             <Select value={settings.defaultTargetLanguage} onValueChange={handleSelectChange('defaultTargetLanguage')}>
              <SelectTrigger id="target-lang">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-style">Default Style</Label>
            <Select value={settings.defaultTranslationStyle} onValueChange={handleSelectChange('defaultTranslationStyle')}>
              <SelectTrigger id="default-style">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map(style => (
                  <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
