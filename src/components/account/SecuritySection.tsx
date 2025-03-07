"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Github, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Current password is required.",
    }),
    newPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

interface SecuritySectionProps {
  user: User | null;
}

export function SecuritySection({ user }: SecuritySectionProps) {
  const { refreshSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Get auth providers
  const identities = user?.identities || [];
  const providers = identities.map((identity) => identity.provider);
  
  // Initialize form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle password change
  async function onSubmit(data: PasswordFormValues) {
    setIsLoading(true);
    
    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: data.currentPassword,
      });
      
      if (signInError) {
        form.setError("currentPassword", { 
          type: "manual", 
          message: "Current password is incorrect" 
        });
        return;
      }
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (error) {
        throw error;
      }
      
      // Reset form
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      // Refresh session
      await refreshSession();
      
      toast.success("Password updated successfully");
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setIsResettingPassword(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Password reset email sent");
    } catch (error: unknown) {
      console.error("Error sending reset email:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset email";
      toast.error(errorMessage);
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Get provider icon
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "github":
        return <Github className="h-4 w-4 mr-2" />;
      case "google":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
        );
      default:
        return <Mail className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password or request a password reset
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.includes("email") ? (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
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
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="••••••••" 
                            type="password" 
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="••••••••" 
                            type="password" 
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePasswordReset}
                      disabled={isResettingPassword || isLoading}
                    >
                      {isResettingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Reset Password via Email"
                      )}
                    </Button>
                    
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          ) : (
            <Alert>
              <AlertDescription>
                Password management is not available for accounts that use social login.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your connected accounts and login methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {providers.length > 0 ? (
              providers.map((provider) => (
                <div
                  key={provider}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {getProviderIcon(provider)}
                      <span className="capitalize">{provider}</span>
                    </div>
                    {provider === "email" && user?.email_confirmed_at && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div>
                    {provider === "email" && !user?.email_confirmed_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const { error } = await supabase.auth.resend({
                              type: 'signup',
                              email: user?.email || '',
                            });
                            
                            if (error) throw error;
                            
                            toast.success("Verification email sent");
                          } catch (error: unknown) {
                            console.error("Error sending verification email:", error);
                            const errorMessage = error instanceof Error 
                              ? error.message 
                              : "Failed to send verification email";
                            toast.error(errorMessage);
                          }
                        }}
                      >
                        Verify Email
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No connected accounts found.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Security Log */}
      <Card>
        <CardHeader>
          <CardTitle>Security Log</CardTitle>
          <CardDescription>
            Recent security activity on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user?.last_sign_in_at && (
              <div className="rounded-lg border p-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Account Login</h4>
                    <p className="text-sm text-muted-foreground">
                      Successful login to your account
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.last_sign_in_at).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            
            {user?.created_at && (
              <div className="rounded-lg border p-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Account Created</h4>
                    <p className="text-sm text-muted-foreground">
                      Your account was created
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
