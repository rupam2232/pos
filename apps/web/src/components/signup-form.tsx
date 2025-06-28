"use client";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signUpSchema } from "@/schemas/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/input-otp";
import axios from "@/utils/axiosInstance";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { signIn, signOut } from "@/store/authSlice";
import { AxiosError } from "axios";
import type { ApiResponse } from "@repo/ui/types/ApiResponse";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [emailLoginLoading, setEmailLoginLoading] = useState(false);
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleGoogleLogin = async (idToken: string) => {
    if (!idToken) {
      toast.error("Google login failed. Please try again.");
      return;
    }
    setGoogleLoginLoading(true);
    try {
      const response = await axios.post("/auth/google", { idToken });
      dispatch(signIn(response.data.data));
      toast.success(response.data.message || "Sign in successful!");
      router.replace("/dashboard");
    } catch (error) {
      dispatch(signOut());
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Google login failed. Please try again."
      );
      console.error(
        axiosError.response?.data.message ||
          "An error occurred during Google login"
      );
    } finally {
      setGoogleLoginLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    console.log(data);
    setEmailLoginLoading(true);
    try {
      const response = await axios.post("/auth/signin", data);
      dispatch(signIn(response.data.data));
      toast.success(response.data.message || "Sign in successful!");
      router.replace("/dashboard");
    } catch (error) {
      dispatch(signOut());
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Login failed. Please check your credentials."
      );
      console.error(
        axiosError.response?.data.message || "An error occurred during login"
      );
    } finally {
      setEmailLoginLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="bg-muted relative hidden md:block">
            <Image
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              src="/placeholder.png"
              alt="Image"
              priority={true}
              className="absolute inset-0 h-full w-full object-cover object-left"
            />
          </div>
          <Form {...form}>
            <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">{`Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}`}</h1>
                  <p className="text-muted-foreground text-balance">
                    {`Create an account to get started with ${process.env.NEXT_PUBLIC_APP_NAME}`}
                  </p>
                </div>

                <div className="relative">
                  {googleLoginLoading ? (
                    <Button
                      disabled
                      className="w-full font-normal bg-white text-black border-zinc-400 border rounded-[4px] py-4.5"
                    >
                      <Loader2 className="animate-spin !h-5 !w-5" />
                      Signing up with Google...
                    </Button>
                  ) : (
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        if (!credentialResponse.credential) {
                          toast.error(
                            "Google signup failed. Please try again."
                          );
                          return;
                        }
                        // Handle the Google signup with the credential
                        handleGoogleLogin(credentialResponse.credential);
                      }}
                      onError={() => {
                        toast.error("Google signup failed. Please try again.");
                      }}
                      logo_alignment="center"
                      text="signup_with"
                      useOneTap={true}
                      auto_select={true}
                    />
                  )}
                  {(googleLoginLoading || emailLoginLoading) && (
                    <div className="absolute inset-0 z-10 bg-white opacity-50 cursor-not-allowed" />
                  )}
                </div>
                <div className="after:border-ring relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="first-name">First Name</FormLabel>
                        <FormControl>
                          <Input
                            id="first-name"
                            type="text"
                            placeholder="Rupam"
                            autoComplete="given-name"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="last-name">Last Name (optional)</FormLabel>
                        <FormControl>
                          <Input
                            id="last-name"
                            type="text"
                            placeholder="Mondal"
                            autoComplete="family-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder="abc@example.com"
                            autoComplete="username"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            placeholder="••••••••"
                            type="password"
                            autoComplete="new-password"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="confirm-password">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="confirm-password"
                            placeholder="••••••••"
                            type="password"
                            autoComplete="new-password"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                          <InputOTP pattern={REGEXP_ONLY_DIGITS} maxLength={6} {...field}>
                            <InputOTPGroup className="gap-2 ">
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          Please enter the one-time password sent to your phone.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={emailLoginLoading || googleLoginLoading}
                >
                  {emailLoginLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Signing up...
                    </>
                  ) : (
                    "Sign up"
                  )}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <a href="/signin" className="underline underline-offset-4">
                    Sign in
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
