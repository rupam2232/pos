"use client";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInSchema } from "@/schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
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

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [emailLoginLoading, setEmailLoginLoading] = useState(false);
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleLogin = async (idToken: string) => {
    if (!idToken) {
      toast.error("Google sign in failed. Please try again.");
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
          "Google sign in failed. Please try again."
      );
      console.error(
        axiosError.response?.data.message ||
          "An error occurred during Google sign in"
      );
    } finally {
      setGoogleLoginLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
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
          "Sign in failed. Please check your credentials."
      );
      console.error(
        axiosError.response?.data.message || "An error occurred during sign in"
      );
    } finally {
      setEmailLoginLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-muted-foreground text-balance">
                    {`Login to your ${process.env.NEXT_PUBLIC_APP_NAME} account`}
                  </p>
                </div>

                <div className="relative">
                  {googleLoginLoading ? (
                    <Button
                      disabled
                      className="w-full font-normal bg-white text-black border-zinc-400 border rounded-[4px] py-4.5"
                    >
                      <Loader2 className="animate-spin !h-5 !w-5" />
                      Signing in with Google...
                    </Button>
                  ) : (
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        if (!credentialResponse.credential) {
                          toast.error("Google sign in failed. Please try again.");
                          return;
                        }
                        // Handle the Google sign in with the credential
                        handleGoogleLogin(credentialResponse.credential);
                      }}
                      onError={() => {
                        toast.error("Google sign in failed. Please try again.");
                      }}
                      logo_alignment="center"
                      useOneTap={true}
                      auto_select={true}
                    />
                  )}
                  {(googleLoginLoading || emailLoginLoading) && (
                    <div
                    className="absolute inset-0 z-10 bg-white opacity-50 cursor-not-allowed"
                    />
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
                        <div className="flex items-center">
                          <FormLabel htmlFor="password">Password</FormLabel>
                          <a
                            href="#"
                            className="ml-auto text-sm underline-offset-2 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <FormControl>
                          <Input
                            id="password"
                            placeholder="••••••••"
                            type="password"
                            autoComplete="current-password"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
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
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </div>
            </form>
          </Form>
          <div className="bg-muted relative hidden md:block">
            <Image
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              src="/placeholder.png"
              alt="Image"
              priority={true}
              className="absolute inset-0 h-full w-full object-cover object-right"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
