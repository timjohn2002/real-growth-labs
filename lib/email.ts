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
): Promise<{ success: boolean; error?: string; details?: string; data?: any; emailId?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured. Email not sent.")
    console.log("Password reset link:", resetLink)
    return { success: false, error: "Email service not configured" }
  }

  try {
    // Use verified domain: labs.realgrowth.art
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@labs.realgrowth.art"
    
    // Validate from email is from verified domain
    if (!fromEmail.includes("@labs.realgrowth.art")) {
      console.error("❌ From email must be from verified domain labs.realgrowth.art")
      console.error("Current from email:", fromEmail)
      return {
        success: false,
        error: `From email must be from verified domain. Current: ${fromEmail}`,
      }
    }
    
    console.log("=".repeat(60))
    console.log("📧 PREPARING TO SEND EMAIL")
    console.log("=".repeat(60))
    console.log("From:", fromEmail)
    console.log("To:", email)
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
    console.log("RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length || 0)
    console.log("=".repeat(60))
    
    console.log("=".repeat(60))
    console.log("📧 RESEND EMAIL SEND REQUEST")
    console.log("=".repeat(60))
    console.log("From:", fromEmail)
    console.log("To:", email)
    console.log("Subject: Reset Your Password - Real Growth Labs")
    console.log("=".repeat(60))

    // Ensure the reset link is properly encoded
    const encodedResetLink = encodeURI(resetLink)
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email], // Ensure it's an array
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
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 20px;">
                <tr>
                  <td style="background-color: #a6261c; border-radius: 6px; text-align: center;">
                    <a 
                      href="${encodedResetLink}" 
                      target="_blank"
                      rel="noopener noreferrer"
                      style="display: inline-block; background-color: #a6261c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;"
                    >
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Or copy and paste this link into your browser:<br>
                <a href="${encodedResetLink}" style="color: #a6261c; word-break: break-all; text-decoration: underline;">${resetLink}</a>
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

    console.log("=".repeat(60))
    console.log("📧 RESEND API RESPONSE")
    console.log("=".repeat(60))
    console.log("Full response:", JSON.stringify(result, null, 2))
    console.log("Response type:", typeof result)
    console.log("Response keys:", Object.keys(result || {}))
    console.log("=".repeat(60))
    
    // Extract email ID from Resend response
    // Resend API returns: { id: "..." } directly
    // Resend SDK might wrap it: { data: { id: "..." } }
    const emailId = (result as any)?.id || (result as any)?.data?.id
    
    console.log("Extracted Email ID:", emailId)
    console.log("Result structure:", {
      hasId: !!(result as any)?.id,
      hasData: !!(result as any)?.data,
      hasDataId: !!(result as any)?.data?.id,
      resultKeys: Object.keys(result || {}),
      dataKeys: (result as any)?.data ? Object.keys((result as any).data) : null,
    })
    
    // Check for errors in response
    if ((result as any)?.error) {
      console.error("❌ Resend returned an error:", (result as any).error)
      return {
        success: false,
        error: (result as any).error.message || "Resend API error",
        details: JSON.stringify((result as any).error, null, 2),
      }
    }
    
    // If no email ID, treat as failure
    if (!emailId) {
      console.error("❌ CRITICAL: No email ID returned from Resend!")
      console.error("This usually means the email was NOT sent.")
      console.error("Possible causes:")
      console.error("  1. Invalid RESEND_API_KEY")
      console.error("  2. From email not authorized for domain")
      console.error("  3. Domain not verified in Resend")
      console.error("  4. Resend API issue")
      
      return {
        success: false,
        error: "No email ID returned from Resend. Email was likely not sent. Please check your Resend configuration.",
        details: `Full response: ${JSON.stringify(result, null, 2)}`,
      }
    }
    
    console.log("✅ Email sent successfully! Email ID:", emailId)
    console.log("=".repeat(60))
    
    return { 
      success: true, 
      data: result,
      emailId: emailId,
    }
  } catch (error: any) {
    console.error("Error sending password reset email:", error)
    
    // Handle Resend-specific errors
    let errorMessage = "Unknown error"
    let errorDetails = String(error)
    
    if (error?.message) {
      errorMessage = error.message
    }
    
    if (error?.response?.body) {
      // Resend API error response
      const resendError = error.response.body
      errorMessage = resendError.message || errorMessage
      errorDetails = JSON.stringify(resendError, null, 2)
      console.error("Resend API Error:", resendError)
    } else if (error instanceof Error) {
      errorDetails = error.stack || error.message
    }
    
    console.error("Full error details:", errorDetails)
    
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
    // Use verified domain: labs.realgrowth.art
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@labs.realgrowth.art"
    
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

