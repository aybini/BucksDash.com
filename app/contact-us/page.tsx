"use client"

import { useState, useEffect, useMemo } from "react"
// Using regular anchor tags instead of Next.js Link
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Send, Phone, MapPin, Copy, Check, ArrowLeft, Loader2, Sparkles } from "lucide-react"
// Custom toast implementation
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{id: number, title: string, description: string, variant?: string}>>([])
  
  const toast = ({ title, description, variant }: {title: string, description: string, variant?: string}) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, title, description, variant }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }
  
  return { toast, toasts }
}
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Form state interface
interface FormState {
  name: string;
  email: string;
  message: string;
  category: string;
}

export default function ContactUsPage() {
  const { toast, toasts } = useToast()
  const [form, setForm] = useState<FormState>({ 
    name: "", 
    email: "", 
    message: "", 
    category: "General" 
  })
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // Company email
  const companyEmail = "aybiniinvestments@gmail.com"

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Memoize particles to prevent recreation on every render
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 2 + Math.random() * 3
    })), []
  )

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setForm((prev) => ({ ...prev, category }))
  }

  // Format the email body
  const getFormattedBody = () => {
    const { name, email, message } = form
    return `
Name: ${name}
Email: ${email}

${message}

---
Sent via Aybini Investments contact form
`.trim()
  }

  // Get email subject
  const getSubject = () => {
    return `${form.category} Inquiry from ${form.name}`
  }

  // Open Gmail with prefilled content
  const openGmail = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Missing Fields", description: "Please fill out all fields.", variant: "destructive" })
      return
    }
    
    setIsRedirecting(true)
    
    // Create the Gmail compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(companyEmail)}&su=${encodeURIComponent(getSubject())}&body=${encodeURIComponent(getFormattedBody())}`
    
    // Open Gmail in a new tab
    window.open(gmailUrl, '_blank')
    
    // Provide feedback
    toast({ title: "Opening Gmail", description: "Gmail should open in a new tab" })
    
    // Reset redirect state after a delay
    setTimeout(() => setIsRedirecting(false), 2000)
  }

  // Open Outlook with prefilled content
  const openOutlook = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Missing Fields", description: "Please fill out all fields.", variant: "destructive" })
      return
    }
    
    setIsRedirecting(true)
    
    // Create the Outlook compose URL
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(companyEmail)}&subject=${encodeURIComponent(getSubject())}&body=${encodeURIComponent(getFormattedBody())}`
    
    // Open Outlook in a new tab
    window.open(outlookUrl, '_blank')
    
    // Provide feedback
    toast({ title: "Opening Outlook", description: "Outlook should open in a new tab" })
    
    // Reset redirect state after a delay
    setTimeout(() => setIsRedirecting(false), 2000)
  }

  // Try generic mailto as fallback
  const tryMailto = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Missing Fields", description: "Please fill out all fields.", variant: "destructive" })
      return
    }
    
    try {
      const mailtoUrl = `mailto:${encodeURIComponent(companyEmail)}?subject=${encodeURIComponent(getSubject())}&body=${encodeURIComponent(getFormattedBody())}`
      window.location.href = mailtoUrl
      toast({ title: "Opening Email Client", description: "Your default email app should open" })
    } catch (err) {
      console.error("Mailto failed:", err)
      toast({ 
        title: "Couldn't open email client", 
        description: "Please try the Gmail or Outlook options instead",
        variant: "destructive"
      })
    }
  }

  // Copy email to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedEmail(true)
      toast({ title: "Copied", description: "Email address copied to clipboard" })
      setTimeout(() => setCopiedEmail(false), 1500)
    } catch (err) {
      console.error("Copy failed:", err)
      toast({ title: "Copy failed", description: "Could not copy email", variant: "destructive" })
    }
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
        <a className="flex items-center justify-center group" href="/" aria-label="BucksDash Finance - Home">
          <span className="text-3xl font-bold bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
            BucksDash
          </span>
          <div className="ml-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="w-5 h-5 text-rose-500 animate-spin" style={{ animationDuration: '3s' }} aria-hidden="true" />
          </div>
        </a>
        
        <div className="ml-auto">
          <a href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </a>
        </div>
      </header>

      <main className="flex-1 relative z-30">
        <div className={`container mx-auto px-4 py-12 transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-rose-700 to-blue-700 dark:from-white dark:via-rose-400 dark:to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              Get in Touch with Us!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              We value your feedback and are here to help. Reach out to us anytime through your preferred method.
            </p>
          </div>

          {/* Main Section */}
          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-800/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-gray-900 dark:text-white">Email Us</CardTitle>
                    <CardDescription className="text-base flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      {companyEmail}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 h-auto hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-full transition-colors duration-300" 
                        onClick={() => copyToClipboard(companyEmail)}
                      >
                        {copiedEmail ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                      </Button>
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              
              <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 dark:text-white">Call Us</CardTitle>
                    <CardDescription className="text-base text-gray-700 dark:text-gray-300">
                      +1 (480) 798-3738
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              
              <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 dark:text-white">Visit Us</CardTitle>
                    <CardDescription className="text-base text-gray-700 dark:text-gray-300">
                      Phoenix, AZ 85001
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              
              <div className="p-6 bg-gradient-to-r from-purple-100/80 to-purple-200/80 dark:from-purple-900/50 dark:to-purple-800/50 backdrop-blur-xl rounded-3xl border border-purple-200/50 dark:border-purple-700/50 shadow-xl">
                <h3 className="font-semibold mb-3 text-purple-800 dark:text-purple-200 text-lg">How to Use Our Contact Form</h3>
                <div className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                  <p>• Fill out the form with your details</p>
                  <p>• Choose Gmail, Outlook, or your default email app</p>
                  <p>• A new tab will open with your message ready to send</p>
                </div>
              </div>
            </div>

            {/* Enhanced Contact Form */}
            <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-xl border-2 border-rose-500/50 dark:border-rose-400/50 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-rose-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              
              <CardHeader className="text-center relative z-10">
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Send Us a Message</CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-300">
                  Fill out this form and choose your preferred email service
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-white">Name</label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-rose-500 dark:focus:border-rose-400 transition-colors duration-300"
                    />
                  </div>
                  
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">Email</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-rose-500 dark:focus:border-rose-400 transition-colors duration-300"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Inquiry Category</label>
                    <Select value={form.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-rose-500 dark:focus:border-rose-400">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                        <SelectItem value="Feedback">Feedback</SelectItem>
                        <SelectItem value="Complaint">Complaint</SelectItem>
                        <SelectItem value="Business">Business Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-900 dark:text-white">Message</label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Type your message..."
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      required
                      className="bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-rose-500 dark:focus:border-rose-400 transition-colors duration-300"
                    />
                  </div>

                  {/* Enhanced Email Service Tabs */}
                  <Tabs defaultValue="gmail" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-gray-800/50">
                      <TabsTrigger value="gmail" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Gmail</TabsTrigger>
                      <TabsTrigger value="outlook" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Outlook</TabsTrigger>
                      <TabsTrigger value="other" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Other</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="gmail" className="mt-4">
                      <Button 
                        onClick={openGmail}
                        className="w-full bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-700 hover:via-rose-700 hover:to-rose-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-rose-500/25 relative overflow-hidden group"
                        disabled={isRedirecting}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="relative flex items-center justify-center">
                          {isRedirecting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Opening Gmail...
                            </>
                          ) : (
                            <>
                              Open in Gmail
                              <Mail className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </span>
                      </Button>
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                        Opens Gmail web interface in a new tab
                      </p>
                    </TabsContent>
                    
                    <TabsContent value="outlook" className="mt-4">
                      <Button 
                        onClick={openOutlook}
                        className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 relative overflow-hidden group"
                        disabled={isRedirecting}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="relative flex items-center justify-center">
                          {isRedirecting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Opening Outlook...
                            </>
                          ) : (
                            <>
                              Open in Outlook
                              <Mail className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </span>
                      </Button>
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                        Opens Outlook web interface in a new tab
                      </p>
                    </TabsContent>
                    
                    <TabsContent value="other" className="mt-4">
                      <Button 
                        onClick={tryMailto}
                        className="w-full bg-gradient-to-r from-gray-600 via-gray-600 to-gray-700 hover:from-gray-700 hover:via-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-gray-500/25 relative overflow-hidden group"
                        disabled={isRedirecting}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="relative flex items-center justify-center">
                          {isRedirecting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Opening...
                            </>
                          ) : (
                            <>
                              Use Default Email App
                              <Mail className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </span>
                      </Button>
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                        Uses your system's default email application
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative z-30" role="contentinfo">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 BucksDash Finance. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6" role="navigation" aria-label="Footer navigation">
          <a className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300" href="/terms">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300" href="/privacy">
            Privacy
          </a>
        </nav>
      </footer>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(({ id, title, description, variant }) => (
          <div
            key={id}
            className={`p-4 rounded-lg shadow-lg backdrop-blur-xl border animate-in slide-in-from-right-5 ${
              variant === 'destructive' 
                ? 'bg-red-100/90 dark:bg-red-900/90 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
                : 'bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            <div className="font-medium">{title}</div>
            <div className="text-sm opacity-80">{description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}