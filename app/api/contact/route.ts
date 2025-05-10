import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Only allow POST requests
export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
    }

    // Set up Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // example: your-email@gmail.com
        pass: process.env.GMAIL_PASS, // app password, not your Gmail password
      },
    })

    // Email options
    const mailOptions = {
      from: `"BucksDash Contact Form" <${process.env.GMAIL_USER}>`,
      to: "aybiniinvestments@gmail.com",
      subject: "New Contact Form Submission",
      text: `
You have a new message from BucksDash:

Name: ${name}
Email: ${email}

Message:
${message}
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending contact form:", error)
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}
