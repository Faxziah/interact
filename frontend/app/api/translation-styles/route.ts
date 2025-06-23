import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/translation-styles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch translation styles')
    }

    const styles = await response.json()
    return NextResponse.json(styles)
  } catch (error) {
    console.error('Error fetching translation styles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translation styles' },
      { status: 500 }
    )
  }
} 