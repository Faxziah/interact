"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Languages, History, Settings, LogOut, User, Sparkles, LogIn } from "lucide-react"
import {redirect} from "next/navigation";
import {router} from "next/client";

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="relative border-b border-white/20 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">

        <Link href="/">
        <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Languages className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Interact
              </h1>
              <p className="text-xs text-gray-500 font-medium">AI Translation</p>
            </div>
        </div>
        </Link>
        <div className="flex items-center space-x-3">
          {session ? (
            <>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="hover:bg-violet-100 transition-colors">
                  <History className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="hover:bg-violet-100 transition-colors">
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/50 rounded-full border border-white/20">
                <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-700 font-medium">{session.user?.email?.split("@")[0]}</span>
              </div>
              <Button
                onClick={() => signOut()}
                variant="outline"
                size="sm"
                className="bg-white/50 border-white/20 hover:bg-white/70 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => redirect('/auth/signin')}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <LogIn className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
              <Button
                onClick={() => redirect('/auth/signup')}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Up</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 