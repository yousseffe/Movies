"use client";

import AuthForm from "@/components/auth/AuthForm";
import { signUpSchema } from "@/lib/validations";
import { signUp } from "@/lib/actions/auth";

const Page = () => (
    <AuthForm
        type="SIGN_UP"
        schema={signUpSchema}
        defaultValues={{
            name: "",
            email: "",
            password: "",
        }}
        onSubmit={signUp}></AuthForm>
);

export default Page;
