import { render, screen, fireEvent } from '@/lib/test-utils'
import SettingsPage from './page'
import '@testing-library/jest-dom'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'

// Mock dependencies
jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const mockToast = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

const mockUseSession = useSession as jest.Mock

describe('SettingsPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear()
    mockUseSession.mockClear()
    mockToast.mockClear()
  })

  it('shows loading state initially', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' })
    render(<SettingsPage />)
    expect(screen.queryAllByRole('generic', { name: '' }).length).toBeGreaterThan(0) // Check for skeletons
  })
  
  it('shows auth required message when unauthenticated', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<SettingsPage />)
    expect(await screen.findByText('Authentication Required')).toBeInTheDocument()
  })

  it('fetches and displays settings', async () => {
    const settings = { defaultModel: 'gpt-4', defaultSourceLang: 'en' }
    mockUseSession.mockReturnValue({ status: 'authenticated' })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(settings),
    })
    render(<SettingsPage />)
    expect(await screen.findByText('gpt-4')).toBeInTheDocument()
    expect(await screen.findByText('English')).toBeInTheDocument()
  })

  it('updates a setting and saves it', async () => {
    const settings = { defaultModel: 'gpt-4' }
    mockUseSession.mockReturnValue({ status: 'authenticated' })
    // First fetch for loading settings
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(settings),
    });
    // Second fetch for saving
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<SettingsPage />)
    
    const modelSelect = await screen.findByRole('combobox', { name: /default model/i })
    fireEvent.click(modelSelect)
    fireEvent.click(await screen.findByText('groq-llama3'))

    const saveButton = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveButton)

    await screen.findByText('Saving...') // Wait for saving state
    
    expect(global.fetch).toHaveBeenCalledWith('/api/users/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultModel: 'groq-llama3' }),
    })
    
    await screen.findByText('Save Changes') // Wait for saving to finish
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Settings saved successfully.',
    })
  })
}) 