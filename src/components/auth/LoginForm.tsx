"use client";

import { useState, useEffect } from "react";
import { signInWithEmail } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { createEnvironmentUrl } from "@/lib/environment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialLogin } from "@/components/auth/SocialLogin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for error parameters in the URL
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      if (error === "auth_callback_error") {
        setAuthError("Authentication failed. Please try again.");
      } else if (error === "access_denied") {
        setAuthError("Access was denied. Please try again.");
      } else if (error === "popup_closed") {
        setAuthError("The login popup was closed. Please try again.");
      } else {
        setAuthError(`Authentication error: ${error}`);
      }
    }
  }, [searchParams]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setAuthError(null); // Clear any previous auth errors
    
    try {
      const { data: signInData, error } = await signInWithEmail(data.email, data.password);
      
      if (error) {
        form.setError("email", { 
          type: "manual", 
          message: "Invalid email or password" 
        });
        return;
      }
      
      console.log("Login successful, redirecting to dashboard...");
      
      // Explicitly redirect to dashboard after successful login
      // This ensures the user is redirected even if the AuthProvider's
      // event listener doesn't trigger properly
      if (signInData.session) {
        const dashboardUrl = createEnvironmentUrl('/dashboard');
        console.log("Redirecting to:", dashboardUrl);
        
        if (typeof window !== 'undefined') {
          window.location.href = dashboardUrl;
        } else {
          router.push("/dashboard");
        }
      }
      
    } catch (error) {
      console.error("Login failed with exception:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="you@example.com" 
                  type="email" 
                  autoComplete="email"
                  disabled={isLoading}
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <FormLabel>Password</FormLabel>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-primary hover:underline mt-1 sm:mt-0"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input 
                  placeholder="••••••••" 
                  type="password" 
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">Remember me</FormLabel>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
        
        <SocialLogin isLoading={isLoading} />
        
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}
