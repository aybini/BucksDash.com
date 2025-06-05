import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
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
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">About BucksDash Finance</h1>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our mission is to help everyone achieve financial wellness through better money management
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-3xl space-y-8 py-12">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Our Story</h2>
                <p className="text-gray-500 dark:text-gray-400">
                BucksDash Finance was founded in 2023 with a simple but powerful mission: to make personal finance
                  management accessible, intuitive, and even enjoyable for everyone. We believe that financial wellness
                  shouldn't be complicated or intimidating.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Our team of finance experts and software engineers came together after experiencing firsthand the
                  challenges of managing personal finances with existing tools. We saw an opportunity to create
                  something better—a platform that combines powerful financial tools with an intuitive, but simple user experience.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Our Philosophy</h2>
                <p className="text-gray-500 dark:text-gray-400">At BucksDash Finance, we believe that:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
                  <li>
                    Everyone deserves access to powerful financial tools, regardless of their financial background or
                    expertise.
                  </li>
                  <li>Financial management should be simple, transparent, and stress-free.</li>
                  <li>We believe financial data should guide and empower every decision you make with your money.</li>
                  <li>Technology should work for people, not the other way around.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Our Team</h2>
                <p className="text-gray-500 dark:text-gray-400">
                BucksDash Finance is built by a diverse team of passionate individuals with backgrounds in finance,
                  technology, design, and customer service. We're united by our commitment to creating the best personal
                  finance tool on the market.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Our team combines decades of experience in financial services with cutting-edge software development
                  expertise. We're constantly learning, iterating, and improving to deliver the best possible experience
                  for our users.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Our Commitment</h2>
                <p className="text-gray-500 dark:text-gray-400">We are committed to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
                  <li>Protecting your financial data with the highest security standards</li>
                  <li>Continuously improving our platform based on user feedback</li>
                  <li>Providing exceptional customer support</li>
                  <li>Maintaining transparent and fair pricing</li>
                  <li>Helping our users achieve their financial goals</li>
                </ul>
              </div>

              <div className="flex justify-center pt-4">
                <Link href="/register">
                  <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
                    Subscribe to BucksDash Finance Today
                  </Button>
                </Link>
              </div>
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
