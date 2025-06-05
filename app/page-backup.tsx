"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center relative">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-2xl font-bold text-rose-600">BucksDash</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 transition-all duration-300 hover:text-rose-600" href="/features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 transition-all duration-300 hover:text-rose-600" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 transition-all duration-300 hover:text-rose-600" href="/about">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 transition-all duration-300 hover:text-rose-600" href="/contact-us">
            Contact-us
          </Link>
        </nav>

        {/* Futuristic Mobile Menu Button */}
        <button
          className="ml-auto md:hidden relative w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-rose-500/25 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Classic Hamburger Lines with Animation */}
            <div className="w-5 h-5 flex flex-col justify-center items-center">
              <span 
                className={`block h-0.5 w-5 bg-white transition-all duration-300 ease-in-out ${
                  isMenuOpen ? 'rotate-45 translate-y-1' : ''
                }`}
              />
              <span 
                className={`block h-0.5 w-5 bg-white transition-all duration-300 ease-in-out mt-1 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span 
                className={`block h-0.5 w-5 bg-white transition-all duration-300 ease-in-out mt-1 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1' : ''
                }`}
              />
            </div>
          </div>
          
          {/* Futuristic Ring Effect */}
          <div className={`absolute inset-0 rounded-full border-2 border-rose-300 transition-all duration-500 ${
            isMenuOpen ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
          }`} />
        </button>

        {/* Enhanced Mobile Navigation Dropdown */}
        <div className={`absolute top-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-xl md:hidden transition-all duration-500 ease-out ${
          isMenuOpen 
            ? 'opacity-100 translate-y-0 visible' 
            : 'opacity-0 -translate-y-4 invisible'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-b from-rose-50/20 to-transparent dark:from-rose-950/20" />
          <nav className="relative flex flex-col p-6 space-y-1">
            {[
              { href: "/features", label: "Features", delay: "100" },
              { href: "/pricing", label: "Pricing", delay: "200" },
              { href: "/about", label: "About", delay: "300" },
              { href: "/contact-us", label: "Contact-us", delay: "400" }
            ].map((item, index) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`text-sm font-medium py-3 px-4 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-300 transform hover:translate-x-2 hover:shadow-md border border-transparent hover:border-rose-200 dark:hover:border-rose-800 ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${item.delay}ms` : '0ms'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-rose-500 rounded-full mr-3 transition-all duration-300 transform scale-0 group-hover:scale-100" />
                  {item.label}
                </span>
              </Link>
            ))}
            
            {/* Futuristic divider */}
            <div className="my-2 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
            
            {/* CTA Button in Mobile Menu */}
            <div className={`pt-2 transition-all duration-500 ${
              isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
            }`} style={{ transitionDelay: isMenuOpen ? '500ms' : '0ms' }}>
              <Link href="/register">
                <Button className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>

        {/* Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1] md:hidden transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-rose-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="inline-flex mb-2 bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300">
                    <Sparkles className="mr-1 h-3 w-3" /> Your Financial Journey Starts Here
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-6xl/none">
                    Simplify your Finances with BucksDash
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Track expenses, manage budgets, and achieve your financial goals with our intuitive finance app
                    designed for modern life.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      View Demo
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500"></div>
              </div>
              <div className="flex items-center justify-center mt-8 lg:mt-0">
                <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-[16/9] overflow-hidden rounded-xl border bg-gradient-to-br from-rose-100 to-rose-50 p-4 shadow-xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-md space-y-4 p-4">
                      <div className="h-24 rounded-lg bg-white shadow-sm flex items-center justify-between px-4">
                        <div className="space-y-1">
                          <div className="h-4 w-24 bg-rose-200 rounded"></div>
                          <div className="h-6 w-32 bg-rose-300 rounded"></div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-rose-300"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-32 rounded-lg bg-white shadow-sm p-3">
                          <div className="h-4 w-16 bg-rose-200 rounded mb-2"></div>
                          <div className="h-8 w-24 bg-rose-300 rounded mb-2"></div>
                          <div className="h-4 w-full bg-gray-100 rounded">
                            <div className="h-4 w-3/4 bg-rose-400 rounded"></div>
                          </div>
                        </div>
                        <div className="h-32 rounded-lg bg-white shadow-sm p-3">
                          <div className="h-4 w-16 bg-rose-200 rounded mb-2"></div>
                          <div className="h-8 w-24 bg-rose-300 rounded mb-2"></div>
                          <div className="h-4 w-full bg-gray-100 rounded">
                            <div className="h-4 w-1/2 bg-rose-400 rounded"></div>
                          </div>
                        </div>
                      </div>
                      <div className="h-24 rounded-lg bg-white shadow-sm p-3">
                        <div className="flex justify-between mb-2">
                          <div className="h-4 w-24 bg-rose-200 rounded"></div>
                          <div className="h-4 w-16 bg-rose-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-gray-100 rounded"></div>
                          <div className="h-3 w-full bg-gray-100 rounded"></div>
                          <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-rose-50 dark:bg-rose-950/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Finances?
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join thousands of users who have taken control of their financial future with BucksDash Finance.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-rose-600 hover:bg-rose-700">
                    Join us today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                Try us and enjoy all Premium features.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 BucksDash Finance. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}