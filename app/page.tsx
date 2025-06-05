"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate particles only on client side to prevent hydration mismatch
    const generatedParticles = [...Array(30)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 2 + Math.random() * 3
    }))
    setParticles(generatedParticles)

    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-white dark:from-gray-900 dark:via-rose-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-500/20 dark:bg-rose-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300/10 dark:bg-rose-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Floating Particles - Only render after hydration */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-rose-600 rounded-full animate-pulse shadow-lg opacity-60"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      <header className="px-4 lg:px-6 h-16 flex items-center relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <Link className="flex items-center justify-center group" href="/">
          <span className="text-3xl font-bold bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
            BucksDash
          </span>
          <div className="ml-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="w-5 h-5 text-rose-500 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </Link>
        
        {/* Enhanced Desktop Navigation */}
        <nav className="ml-auto hidden md:flex gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 transition-all duration-300 hover:text-rose-600 dark:hover:text-rose-400 relative group" href="/features">
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 transition-all duration-300 hover:text-rose-600 dark:hover:text-rose-400 relative group" href="/pricing">
            Pricing
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 transition-all duration-300 hover:text-rose-600 dark:hover:text-rose-400 relative group" href="/about">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 transition-all duration-300 hover:text-rose-600 dark:hover:text-rose-400 relative group" href="/contact-us">
            Contact-us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>

        {/* Enhanced Futuristic Mobile Menu Button */}
        <button
          className="ml-auto md:hidden relative w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-rose-500/25 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Classic Hamburger Lines with Animation */}
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span 
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ease-in-out ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span 
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ease-in-out mt-1.5 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span 
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ease-in-out mt-1.5 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </div>
          </div>
          
          {/* Enhanced Futuristic Ring Effect */}
          <div className={`absolute inset-0 rounded-full border-2 border-rose-300 transition-all duration-500 ${
            isMenuOpen ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
          }`} />
          <div className={`absolute inset-0 rounded-full border border-white/30 transition-all duration-700 ${
            isMenuOpen ? 'scale-200 opacity-0' : 'scale-100 opacity-100'
          }`} />
        </button>

        {/* Enhanced Mobile Navigation Dropdown */}
        <div className={`absolute top-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-2xl md:hidden transition-all duration-500 ease-out z-50 ${
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
                <Button className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative flex items-center justify-center">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </Link>
            </div>
          </nav>
        </div>

        {/* Enhanced Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </header>

      <main className="flex-1 relative z-30">
        {/* Enhanced Hero Section */}
        <section className={`w-full py-12 md:py-24 lg:py-32 xl:py-48 relative transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <Badge className="inline-flex mb-4 bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 dark:from-rose-900 dark:to-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" /> 
                    Your Financial Journey Starts Here
                  </Badge>
                  
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none bg-gradient-to-r from-gray-900 via-rose-700 to-gray-900 dark:from-white dark:via-rose-400 dark:to-white bg-clip-text text-transparent drop-shadow-lg">
                    Simplify your Finances with BucksDash
                  </h1>
                  
                  <p className="max-w-[600px] text-gray-600 md:text-xl dark:text-gray-300 leading-relaxed">
                    Track expenses, manage budgets, and achieve your financial goals with our intuitive finance app
                    designed for modern life.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-700 hover:via-rose-700 hover:to-rose-800 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-rose-500/25 relative overflow-hidden group text-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <span className="relative flex items-center justify-center">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    </Button>
                  </Link>
                  
                  <Link href="/demo">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full sm:w-auto bg-white/90 dark:bg-white/10 backdrop-blur-xl border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/20 py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg font-semibold"
                    >
                      View Demo
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Enhanced Demo Mockup */}
              <div className="flex items-center justify-center mt-8 lg:mt-0">
                <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-[16/9] overflow-hidden rounded-3xl border border-gray-200/50 dark:border-white/20 bg-gradient-to-br from-rose-100 via-white to-rose-50 dark:from-rose-900/30 dark:via-gray-800 dark:to-rose-900/30 p-6 shadow-2xl backdrop-blur-xl group hover:shadow-3xl transition-all duration-500">
                  {/* Enhanced glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-rose-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-md space-y-4 p-4 relative z-10">
                      {/* Enhanced mockup cards */}
                      <div className="h-24 rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-xl shadow-lg flex items-center justify-between px-6 border border-gray-200/50 dark:border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gradient-to-r from-rose-200 to-rose-300 rounded-full"></div>
                          <div className="h-6 w-32 bg-gradient-to-r from-rose-300 to-rose-400 rounded-full"></div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-rose-300 to-rose-400 shadow-lg"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-32 rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-xl shadow-lg p-4 border border-gray-200/50 dark:border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <div className="h-4 w-16 bg-gradient-to-r from-rose-200 to-rose-300 rounded-full mb-3"></div>
                          <div className="h-8 w-24 bg-gradient-to-r from-rose-300 to-rose-400 rounded-full mb-3"></div>
                          <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-4 w-3/4 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"></div>
                          </div>
                        </div>
                        
                        <div className="h-32 rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-xl shadow-lg p-4 border border-gray-200/50 dark:border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <div className="h-4 w-16 bg-gradient-to-r from-rose-200 to-rose-300 rounded-full mb-3"></div>
                          <div className="h-8 w-24 bg-gradient-to-r from-rose-300 to-rose-400 rounded-full mb-3"></div>
                          <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-4 w-1/2 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-24 rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-xl shadow-lg p-4 border border-gray-200/50 dark:border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex justify-between mb-3">
                          <div className="h-4 w-24 bg-gradient-to-r from-rose-200 to-rose-300 rounded-full"></div>
                          <div className="h-4 w-16 bg-gradient-to-r from-rose-200 to-rose-300 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                          <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                          <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Call to Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-rose-50 via-white to-rose-50 dark:from-rose-950/20 dark:via-gray-900 dark:to-rose-950/20 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-rose-300/20 dark:bg-rose-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-rose-400/20 dark:bg-rose-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4 max-w-4xl">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-gray-900 via-rose-700 to-gray-900 dark:from-white dark:via-rose-400 dark:to-white bg-clip-text text-transparent drop-shadow-lg">
                  Ready to Transform Your Finances?
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-300 leading-relaxed">
                  Join thousands of users who have taken control of their financial future with BucksDash Finance.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-700 hover:via-rose-700 hover:to-rose-800 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-rose-500/25 relative overflow-hidden group text-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative flex items-center justify-center">
                      Join us today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  </Button>
                </Link>
                
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full bg-white/90 dark:bg-white/10 backdrop-blur-xl border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/20 py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg font-semibold"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-gray-200/50 dark:border-white/20">
                Try us and enjoy all Premium features.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative z-30">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 BucksDash Finance. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}