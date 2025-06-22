import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import SignUpPage from './page'
import '@testing-library/jest-dom'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Mock next-auth and next/navigation
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  signIn: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}))

describe('SignUpPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (signIn as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders sign-up form and handles submission', async () => {
    // Mock successful registration response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<SignUpPage />)

    // Check if form elements are rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    const signUpButton = screen.getByRole('button', { name: /create an account/i })
    expect(signUpButton).toBeInTheDocument()

    // Simulate user input
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })

    // Simulate form submission
    fireEvent.click(signUpButton)
    
    // Check if fetch was called for registration
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    })

    // Check if signIn was called after successful registration
    await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
            redirect: false,
            email: 'test@example.com',
            password: 'password123',
        });
    });
  })
}) 