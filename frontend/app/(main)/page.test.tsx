import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import Page from './page'
import '@testing-library/jest-dom'
import { useSession } from 'next-auth/react'

jest.mock('next-auth/react', () => ({
    __esModule: true,
    useSession: jest.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const mockUseSession = useSession as jest.Mock

describe('HomePage', () => {
  beforeEach(() => {
    // Clear all mocks
    (global.fetch as jest.Mock).mockClear()
    mockUseSession.mockClear()

    // Default mocks
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ languages: [], translationStyles: [], recentTranslations: [] }),
    })
  })

  it('renders the main heading', async () => {
    render(<Page />)
    const heading = await screen.findByRole('heading', { name: /interact/i })
    expect(heading).toBeInTheDocument()
  })

  it('allows user to type and translate text', async () => {
    // Override fetch for this specific test
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ translatedText: 'Привет, мир' }),
    })

    render(<Page />)

    await screen.findByRole('heading', { name: /interact/i })

    const inputTextArea = screen.getByPlaceholderText(/enter text to translate/i)
    fireEvent.change(inputTextArea, { target: { value: 'Hello, world' } })

    const translateButton = screen.getByRole('button', { name: /translate/i })
    fireEvent.click(translateButton)

    const outputTextArea = await screen.findByDisplayValue('Привет, мир')
    expect(outputTextArea).toBeInTheDocument()
  })

  it("allows authenticated user to type text", async () => {
    // Mock session to be authenticated for this test
    mockUseSession.mockReturnValue({ data: { user: { email: "test@example.com" } }, status: "authenticated" })
    render(<Page />)

    const heading = await screen.findByRole('heading', { name: /interact/i })
    expect(heading).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText("Enter text to translate...")
    fireEvent.change(textarea, { target: { value: "Hello, world!" } });
    expect(textarea).toHaveValue("Hello, world!")
  })
}) 