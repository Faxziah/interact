"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Languages, History, Settings, LogOut, User } from "lucide-react"
import { MobileNav } from "@/components/ui/mobile-nav"
import { Sheet } from "@/components/ui/sheet"

export function Header() {
  const { data: session } = useSession()

  const mainNav = (
    <>
      <Link href="/history" className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        <History className="h-4 w-4 mr-2" />
        History
      </Link>
      <Link href="/settings" className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Link>
    </>
  )

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Languages className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">Interact</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {session && mainNav}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <div className="hidden items-center space-x-2 md:flex">
                <User className="h-4 w-4" />
                <span className="text-sm text-gray-600">{session.user?.email}</span>
              </div>
              <Button onClick={() => signOut()} variant="outline" size="sm" className="hidden md:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => signIn()} variant="default">
              Sign In
            </Button>
          )}
          <MobileNav>
            {session ? (
              <div className="flex flex-col space-y-4">
                {mainNav}
                 <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-4 w-4" />
                    <span className="text-sm text-gray-600">{session.user?.email}</span>
                  </div>
                  <Button onClick={() => signOut()} variant="outline" className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
               <Button onClick={() => signIn()} variant="default" className="w-full">
                Sign In
              </Button>
            )}
          </MobileNav>
        </div>
      </div>
    </header>
  )
} 