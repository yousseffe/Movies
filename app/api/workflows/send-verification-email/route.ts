import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";

interface VerificationData {
    email: string;
    name: string;
    verificationUrl: string;
}
export const { POST } = serve<VerificationData>(async (context) => {
    const { email, name, verificationUrl } = context.requestPayload;



    await context.run("send-verification-email", async () => {
        await sendEmail({
            email,
            subject: "Verify Your Email - Movie Platform",
            message: `
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
          <div style='background-color: #D92424; padding: 20px; text-align: center;'>
            <h1 style='color: #fff;'>Welcome to Movie Platform!</h1>
          </div>
          <div style='padding: 20px;'>
            <p>Hello ${name},</p>
            <p>Thanks for signing up! Please verify your email by clicking the button below:</p>
            <div style='text-align: center; margin: 30px 0;'>
              <a href='${verificationUrl}'
                 style='background-color: #0070f3; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;'>
                Verify Email
              </a>
            </div>
            <p>If you did not sign up, please ignore this email.</p>
          </div>
          <div style='background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;'>
            <p>© ${new Date().getFullYear()} Movie Platform. All rights reserved.</p>
          </div>
        </div>
      `,
        });
    });
});