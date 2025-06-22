import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import SignInPage from './page'
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

describe('SignInPage', () => {
  it('renders sign-in form and handles submission', async () => {
    render(<SignInPage />)

    // Check if form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    expect(signInButton).toBeInTheDocument()

    // Simulate user input
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })

    // Simulate form submission
    fireEvent.click(signInButton)

    // Check if signIn was called with correct credentials
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })
}) 