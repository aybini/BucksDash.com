import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-2xl font-bold text-rose-600">BucksDash</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/contact-us">
            Contact-us
          </Link>
        </nav>
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
                    Simplify Your Finances with BucksDash
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

        {/* The rest of your original code remains unchanged (Core Features, Premium Features, Testimonials, CTA, Footer) */}

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
