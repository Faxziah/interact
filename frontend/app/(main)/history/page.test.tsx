import { render, screen, waitFor } from '@/lib/test-utils'
import HistoryPage from './page'
import '@testing-library/jest-dom'
import { useSession } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: jest.fn(),
  // We need to provide a mock for SessionProvider even if it's empty
  // because our custom render uses it.
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const mockUseSession = useSession as jest.Mock

describe('HistoryPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear()
    mockUseSession.mockClear()
  })

  it('shows loading state initially', () => {
    mockUseSession.mockReturnValue({ data: { user: { email: 'test@test.com' } }, status: 'loading' })
    render(<HistoryPage />)
    expect(screen.getAllByRole('generic', { name: '' })[0]).toBeInTheDocument() // Rough check for Skeleton
  })

  it('shows an error message if fetch fails', async () => {
    mockUseSession.mockReturnValue({ data: { user: { email: 'test@test.com' } }, status: 'authenticated' })
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'))
    render(<HistoryPage />)
    await waitFor(() => {
        expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument()
    })
  })

  it('shows message if not authenticated', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<HistoryPage />)
    await waitFor(() => {
        expect(screen.getByText('Authentication Required')).toBeInTheDocument()
    })
  })

  it('displays translation history when fetch is successful', async () => {
    const mockTranslations = [
      { id: '1', originalText: 'Hello', translatedText: 'Hola', sourceLang: 'en', targetLang: 'es', createdAt: new Date().toISOString() },
      { id: '2', originalText: 'Goodbye', translatedText: 'Adiós', sourceLang: 'en', targetLang: 'es', createdAt: new Date().toISOString() },
    ]
    mockUseSession.mockReturnValue({ data: { user: { email: 'test@test.com' } }, status: 'authenticated' })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTranslations),
    })

    render(<HistoryPage />)

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })
  })

  it('shows a message when there is no history', async () => {
    mockUseSession.mockReturnValue({ data: { user: { email: 'test@test.com' } }, status: 'authenticated' })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    render(<HistoryPage />)

    await waitFor(() => {
        expect(screen.getByText('No translation history found.')).toBeInTheDocument()
    })
  })
}) 