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

interface Language {
  code: string;
  name: string;
}

interface TranslationStyle {
  value: string;
  label: string;
}

interface Model {
  value: string;
  label:string;
  disabled: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings>({})
  const [languages, setLanguages] = useState<Language[]>([])
  const [styles, setStyles] = useState<TranslationStyle[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchInitialData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [settingsRes, languagesRes, stylesRes, modelsRes] = await Promise.all([
            fetch('/api/users/settings'),
            fetch('/api/languages'),
            fetch('/api/translation-styles'),
            fetch('/api/models')
          ]);

          if (!settingsRes.ok) throw new Error('Failed to fetch settings');
          if (!languagesRes.ok) throw new Error('Failed to fetch languages');
          if (!stylesRes.ok) throw new Error('Failed to fetch styles');
          if (!modelsRes.ok) throw new Error('Failed to fetch models');

          const settingsData = await settingsRes.json();
          const languagesData = await languagesRes.json();
          const stylesData = await stylesRes.json();
          const modelsData = await modelsRes.json();
          
          setSettings(settingsData);
          setLanguages([{ code: 'auto', name: 'Auto Detect' }, ...languagesData]);
          setStyles(stylesData);
          setModels(modelsData);

        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialData();
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
                {models.map(model => (
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
                {languages.map(lang => (
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
                {languages.filter(lang => lang.code !== 'auto').map(lang => (
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
                {styles.map(style => (
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
