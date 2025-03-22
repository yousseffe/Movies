"use server";

import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import {signIn, signOut} from "@/auth";
import { headers } from "next/headers";
import ratelimit from "@/lib/ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "@/lib/workflow";
import config from "@/lib/config";
import {sendWelcomeEmail} from "@/lib/email";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">,
) => {
  const { email, password } = params;
  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  console.log(ip)
  const { success } = await ratelimit.limit(ip);
  console.log(success)
  //
  // if (!success) return redirect("/too-fast");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "Signin error" };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { name , email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) return redirect("/too-fast");

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  const hashedPassword = await hash(password, 10);
  const verificationToken = crypto.randomUUID() ; // Generate a unique token
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

  try {
    // @ts-ignore
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      verificationToken : verificationToken ,
      verificationTokenExpiry,
    });
    console.log("User created successfully")
    // await workflowClient.trigger({
    //   url: `${config.env.prodApiEndpoint}/api/workflows/send-verification-email`,
    //   body: {
    //     email,
    //     name,
    //   },
    // });
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
    await sendWelcomeEmail(email, name, verificationUrl)
    console.log("Email sent successfully");
    await signInWithCredentials({ email, password });

    return {error: "", success: true };
  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, error: "Signup error" };
  }
};
export const logout = async () => {
  await signOut();
  redirect("/login")
}