"use client"

import { useState, useEffect, useMemo, ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Users, Target, Shield, Heart, ArrowRight, LucideIcon } from "lucide-react"

// Type definitions
type ColorClass = 'rose' | 'blue' | 'green' | 'purple'

interface NavigationItem {
  href: string
  label: string
}

interface CardSection {
  id: string
  icon: LucideIcon
  title: string
  colorClass: ColorClass
  content: ReactNode
}

interface NavLinkProps {
  href: string
  children: ReactNode
}

interface ContentCardProps {
  section: CardSection
}

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Memoize particles to prevent recreation on every render
  const particles = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 2 + Math.random() * 3
    })), []
  )

  const navigationItems: NavigationItem[] = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" }
  ]

  const philosophyPoints: string[] = [
    "Everyone deserves access to powerful financial tools, regardless of their financial background or expertise.",
    "Financial management should be simple, transparent, and stress-free.",
    "We believe financial data should guide and empower every decision you make with your money.",
    "Technology should work for people, not the other way around."
  ]

  const commitmentPoints: string[] = [
    "Protecting your financial data with the highest security standards",
    "Continuously improving our platform based on user feedback",
    "Providing exceptional customer support",
    "Maintaining transparent and fair pricing",
    "Helping our users achieve their financial goals"
  ]

  const cardSections: CardSection[] = [
    {
      id: "story",
      icon: Users,
      title: "Our Story",
      colorClass: "rose",
      content: (
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            BucksDash Finance was founded in 2023 with a simple but powerful mission: to make personal finance
            management accessible, intuitive, and even enjoyable for everyone. We believe that financial wellness
            shouldn't be complicated or intimidating.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            Our team of finance experts and software engineers came together after experiencing firsthand the
            challenges of managing personal finances with existing tools. We saw an opportunity to create
            something better—a platform that combines powerful financial tools with an intuitive, but simple user experience.
          </p>
        </>
      )
    },
    {
      id: "philosophy",
      icon: Target,
      title: "Our Philosophy",
      colorClass: "blue",
      content: (
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
            At BucksDash Finance, we believe that:
          </p>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-lg" role="list">
            {philosophyPoints.map((point, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0" aria-hidden="true"></div>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      id: "team",
      icon: Heart,
      title: "Our Team",
      colorClass: "green",
      content: (
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            BucksDash Finance is built by a diverse team of passionate individuals with backgrounds in finance,
            technology, design, and customer service. We're united by our commitment to creating the best personal
            finance tool on the market.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            Our team combines decades of experience in financial services with cutting-edge software development
            expertise. We're constantly learning, iterating, and improving to deliver the best possible experience
            for our users.
          </p>
        </>
      )
    },
    {
      id: "commitment",
      icon: Shield,
      title: "Our Commitment",
      colorClass: "purple",
      content: (
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
            We are committed to:
          </p>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-lg" role="list">
            {commitmentPoints.map((point, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-3 flex-shrink-0" aria-hidden="true"></div>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </>
      )
    }
  ]

  const NavLink = ({ href, children }: NavLinkProps) => (
    <Link 
      className="text-sm font-medium hover:underline underline-offset-4 transition-all duration-300 hover:text-rose-600 dark:hover:text-rose-400 relative group" 
      href={href}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300" aria-hidden="true"></span>
    </Link>
  )

  const ContentCard = ({ section }: ContentCardProps) => {
    const Icon = section.icon
    const colorClasses: Record<ColorClass, string> = {
      rose: "from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-800/50 text-rose-600 dark:text-rose-400",
      blue: "from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-600 dark:text-blue-400",
      green: "from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-600 dark:text-green-400",
      purple: "from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 text-purple-600 dark:text-purple-400"
    }

    const hoverGradients: Record<ColorClass, string> = {
      rose: "from-rose-500/5 via-transparent to-rose-500/5",
      blue: "from-blue-500/5 via-transparent to-blue-500/5",
      green: "from-green-500/5 via-transparent to-green-500/5",
      purple: "from-purple-500/5 via-transparent to-purple-500/5"
    }

    const hoverBorders: Record<ColorClass, string> = {
      rose: "from-rose-500/20 to-rose-600/20",
      blue: "from-blue-500/20 to-blue-600/20",
      green: "from-green-500/20 to-green-600/20",
      purple: "from-purple-500/20 to-purple-600/20"
    }

    return (
      <section 
        className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500"
        aria-labelledby={`${section.id}-heading`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${hoverGradients[section.colorClass]} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} aria-hidden="true" />
        <div className={`absolute -inset-1 bg-gradient-to-r ${hoverBorders[section.colorClass]} rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500`} aria-hidden="true" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 bg-gradient-to-r ${colorClasses[section.colorClass].split(' ').slice(0, 4).join(' ')} rounded-2xl`}>
              <Icon className={`w-6 h-6 ${colorClasses[section.colorClass].split(' ').slice(-2).join(' ')}`} aria-hidden="true" />
            </div>
            <h2 id={`${section.id}-heading`} className="text-3xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
          </div>
          
          <div className="space-y-4">
            {section.content}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-white dark:from-gray-900 dark:via-rose-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300/10 dark:bg-rose-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-blue-400 rounded-full animate-pulse shadow-lg opacity-60"
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
        <Link className="flex items-center justify-center group" href="/" aria-label="BucksDash Finance - Home">
          <span className="text-3xl font-bold bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
            BucksDash
          </span>
          <div className="ml-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="w-5 h-5 text-rose-500 animate-spin" style={{ animationDuration: '3s' }} aria-hidden="true" />
          </div>
        </Link>
        
        <nav className="ml-auto flex gap-6" role="navigation" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 relative z-30">
        {/* Enhanced Hero Section */}
        <section className={`w-full py-12 md:py-24 lg:py-32 transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4 max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-gray-900 via-rose-700 to-blue-700 dark:from-white dark:via-rose-400 dark:to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                  About BucksDash Finance
                </h1>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-300 leading-relaxed">
                  Our mission is to help everyone achieve financial wellness through better money management
                </p>
              </div>
            </div>

            {/* Enhanced Content Cards */}
            <div className="mx-auto max-w-4xl space-y-8 py-12">
              {cardSections.map((section) => (
                <ContentCard key={section.id} section={section} />
              ))}

              {/* Enhanced CTA Section */}
              <div className="flex justify-center pt-8">
                <div className="text-center space-y-4">
                  <Link href="/register">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-700 hover:via-rose-700 hover:to-rose-800 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-rose-500/25 relative overflow-hidden group text-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" aria-hidden="true" />
                      <span className="relative flex items-center justify-center">
                        Subscribe to BucksDash Finance Today
                        <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative z-30" role="contentinfo">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 BucksDash Finance. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6" role="navigation" aria-label="Footer navigation">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300" href="/privacy">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}