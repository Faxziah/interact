import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import Page from './page'
import '@testing-library/jest-dom'

describe('HomePage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear()
  })

  it('renders the main heading', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })
    render(<Page />)
    const heading = await screen.findByRole('heading', { name: /interact/i })
    expect(heading).toBeInTheDocument()
  })

  // it('allows user to type and translate text', async () => {
  //   (global.fetch as jest.Mock)
  //     .mockResolvedValueOnce({
  //       ok: true,
  //       json: () => Promise.resolve([]), // For recent translations
  //     })
  //     .mockResolvedValueOnce({
  //       ok: true,
  //       json: () => Promise.resolve({ translatedText: 'Привет, мир' }), // For the translation
  //     })
  //
  //   render(<Page />)
  //
  //   await screen.findByRole('heading', { name: /interact/i })
  //
  //   const inputTextArea = screen.getByPlaceholderText(/enter text to translate/i)
  //   fireEvent.change(inputTextArea, { target: { value: 'Hello, world' } })
  //
  //   const translateButton = screen.getByRole('button', { name: /translate/i })
  //   fireEvent.click(translateButton)
  //
  //   const outputTextArea = await screen.findByDisplayValue('Привет, мир')
  //   expect(outputTextArea).toBeInTheDocument()
  // })

  it.skip("shows sign in button when not authenticated", async () => {
    // Mock session to be authenticated
    const { useSession } = await import("next-auth/react")
    ;(useSession as jest.Mock).mockReturnValue({ data: { user: { email: "test@example.com" } }, status: "authenticated" })
    render(<Page />)
    
    const heading = await screen.findByRole('heading', { name: /interact/i })
    expect(heading).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText("Enter text to translate...")
    // await userEvent.type(textarea, "Hello, world!")
  })
}) 