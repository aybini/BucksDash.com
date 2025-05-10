"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Send, Phone, MapPin, Copy, Check, ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
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
  const { toast } = useToast()
  const [form, setForm] = useState<FormState>({ 
    name: "", 
    email: "", 
    message: "", 
    category: "General" 
  })
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  // Company email
  const companyEmail = "aybiniinvestments@gmail.com"

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
    <div className="container mx-auto px-4 py-12">
      {/* Back to Home */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-rose-600">Get in Touch with Us!</h1>
        <p className="text-muted-foreground text-lg">We value your feedback. Reach out to us anytime.</p>
      </div>

      {/* Main Section */}
      <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Mail className="h-6 w-6 text-rose-500" />
              <div>
                <CardTitle>Email Us</CardTitle>
                <CardDescription className="text-base flex items-center gap-2">
                  {companyEmail}
                  <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => copyToClipboard(companyEmail)}>
                    {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Phone className="h-6 w-6 text-rose-500" />
              <div>
                <CardTitle>Call Us</CardTitle>
                <CardDescription className="text-base">
                  +1 (480) 798-3738
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <MapPin className="h-6 w-6 text-rose-500" />
              <div>
                <CardTitle>Visit Us</CardTitle>
                <CardDescription className="text-base">
                  Phoenix, AZ 85001
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
          
          <div className="p-4 bg-slate-100 rounded-lg border">
            <h3 className="font-medium mb-2">How to Use Our Contact Form</h3>
            <p className="text-sm text-muted-foreground">
              1. Fill out the form with your details
              <br />
              2. Choose Gmail or Outlook to compose your email
              <br />
              3. A new tab will open with your message ready to send
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <Card className="border-2 border-rose-500 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Send Us a Message</CardTitle>
            <CardDescription>
              Fill out this form and choose your preferred email service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Inquiry Category</label>
                <Select value={form.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
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
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Type your message..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email Service Tabs */}
              <Tabs defaultValue="gmail" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="gmail">Gmail</TabsTrigger>
                  <TabsTrigger value="outlook">Outlook</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
                
                <TabsContent value="gmail" className="mt-4">
                  <Button 
                    onClick={openGmail}
                    className="w-full bg-rose-600 hover:bg-rose-700"
                    disabled={isRedirecting}
                  >
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
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Opens Gmail web interface in a new tab
                  </p>
                </TabsContent>
                
                <TabsContent value="outlook" className="mt-4">
                  <Button 
                    onClick={openOutlook}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isRedirecting}
                  >
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
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Opens Outlook web interface in a new tab
                  </p>
                </TabsContent>
                
                <TabsContent value="other" className="mt-4">
                  <Button 
                    onClick={tryMailto}
                    className="w-full"
                    disabled={isRedirecting}
                  >
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
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Uses your system's default email application
                  </p>
                </TabsContent>
              </Tabs>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}