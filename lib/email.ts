/**
 * Email Utilities
 * Handles sending emails via Resend
 */

import { Resend } from "resend"

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured. Email not sent.")
    console.log("Password reset link:", resetLink)
    return { success: false, error: "Email service not configured" }
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
    
    console.log("Sending password reset email:", { to: email, from: fromEmail })
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Reset Your Password - Real Growth Labs",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; text-align: center;">
              <h1 style="color: #a6261c; margin-bottom: 20px;">Reset Your Password</h1>
              <p style="color: #666; margin-bottom: 30px;">
                You requested to reset your password for your Real Growth Labs account.
              </p>
              <a 
                href="${resetLink}" 
                style="display: inline-block; background-color: #a6261c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 20px;"
              >
                Reset Password
              </a>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #a6261c; word-break: break-all;">${resetLink}</a>
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 1 hour.<br>
                If you didn't request this, please ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
        Reset Your Password - Real Growth Labs
        
        You requested to reset your password for your Real Growth Labs account.
        
        Click the link below to reset your password:
        ${resetLink}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
      `,
    })

    console.log("Email sent successfully:", result)
    return { 
      success: true, 
      data: result,
      emailId: result.data?.id || result.id,
    }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error("Error details:", errorDetails)
    return {
      success: false,
      error: errorMessage,
      details: errorDetails,
    }
  }
}

/**
 * Send welcome email (for future use)
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured. Email not sent.")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
    
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Welcome to Real Growth Labs!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Real Growth Labs</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px;">
              <h1 style="color: #a6261c; margin-bottom: 20px;">Welcome to Real Growth Labs!</h1>
              <p style="color: #666; margin-bottom: 20px;">
                Hi ${name},
              </p>
              <p style="color: #666; margin-bottom: 20px;">
                Thank you for joining Real Growth Labs! We're excited to help you turn your knowledge into books, lead magnets, and audiobooks.
              </p>
              <p style="color: #666;">
                Get started by creating your first book in the dashboard!
              </p>
            </div>
          </body>
        </html>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

