"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

interface Translation {
  id: string
  originalText: string
  translatedText: string
  sourceLang: string
  targetLang: string
  createdAt: string
}

export default function HistoryPage() {
  const { data: session } = useSession()
  const [translations, setTranslations] = useState<Translation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      const fetchHistory = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const response = await fetch('/api/translations/recent')
          if (!response.ok) {
            throw new Error('Failed to fetch translation history')
          }
          const data = await response.json()
          setTranslations(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred')
        } finally {
          setIsLoading(false)
        }
      }
      fetchHistory()
    } else {
      setIsLoading(false)
    }
  }, [session])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
  
  if (!session) {
    return (
       <div className="container mx-auto px-4 py-8">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please sign in to view your translation history.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Translation History</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Original</TableHead>
                <TableHead>Translated</TableHead>
                <TableHead className="hidden md:table-cell">From</TableHead>
                <TableHead className="hidden md:table-cell">To</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {translations.length > 0 ? (
                translations.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium truncate max-w-xs">{t.originalText}</TableCell>
                    <TableCell className="truncate max-w-xs">{t.translatedText}</TableCell>
                    <TableCell className="hidden md:table-cell">{t.sourceLang.toUpperCase()}</TableCell>
                    <TableCell className="hidden md:table-cell">{t.targetLang.toUpperCase()}</TableCell>
                    <TableCell className="text-right">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No translation history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
