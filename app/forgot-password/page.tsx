// app/forgot-password/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Mail,
  CheckCircle,
  Sparkles,
  Shield,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const { resetPassword } = useAuth();

  // State for error dialog
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    // Get email from URL parameters if available
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorDialog({
        isOpen: true,
        title: "Email required",
        message: "Please enter your email address.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email.trim());

      setEmailSent(true);

      toast({
        title: "Reset email sent!",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      let errorMessage = "Failed to send reset email. Please try again.";
      let errorTitle = "Reset failed";

      if (error.code === "auth/user-not-found") {
        errorTitle = "Account not found";
        errorMessage =
          "No account found with this email address. Please check your email or create a new account.";
      } else if (error.code === "auth/invalid-email") {
        errorTitle = "Invalid email";
        errorMessage = "Invalid email format. Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorTitle = "Too many requests";
        errorMessage =
          "Too many password reset attempts. Please wait a few minutes before trying again.";
      } else if (error.code === "auth/network-request-failed") {
        errorTitle = "Connection error";
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.code === "auth/missing-email") {
        errorTitle = "Email required";
        errorMessage = "Please enter your email address.";
      }

      setErrorDialog({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeErrorDialog = () => {
    setErrorDialog({
      isOpen: false,
      title: "",
      message: "",
    });
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    // The form will be shown again for re‐submission
  };

  if (emailSent) {
    // --- SUCCESS STATE UI ---
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-green-50/30 to-white dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* --- Background Elements (Success) --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse shadow-2xl"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300/10 dark:bg-green-400/5 rounded-full blur-3xl animate-pulse shadow-2xl"
            style={{ animationDelay: "4s" }}
          />
        </div>

        {/* --- Floating Particles (Success) --- */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div
          className={`w-full max-w-md space-y-8 relative z-10 transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* --- Success Message --- */}
          <div className="text-center space-y-6">
            <div className="relative group">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400 animate-pulse" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 dark:from-green-400 dark:via-emerald-400 dark:to-green-500 bg-clip-text text-transparent drop-shadow-lg">
              Check your email
            </h1>

            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We've sent password reset instructions to:
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-xl border border-green-200 dark:border-green-700">
                  {email}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Check your inbox and click the link in the email to reset your
                  password.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-green-600 via-green-600 to-emerald-700 hover:from-green-700 hover:via-green-700 hover:to-emerald-800 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/25 relative overflow-hidden group text-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative">Back to Login</span>
            </Button>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Didn't receive the email?{" "}
                <button
                  onClick={handleResendEmail}
                  className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-300 relative group"
                >
                  Send again
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
                </button>
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-300 inline-flex items-center group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- RESET FORM UI (default) ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-rose-50/30 to-white dark:from-gray-900 dark:via-rose-900/20 dark:to-gray-900 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse shadow-2xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300/10 dark:bg-rose-400/5 rounded-full blur-3xl animate-pulse shadow-2xl"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-blue-400 rounded-full animate-pulse shadow-lg opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`w-full max-w-md space-y-8 relative z-10 transition-all duration-1000 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="relative group">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 bg-clip-text text-transparent animate-pulse drop-shadow-lg">
              BucksDash
            </h1>
            <div className="absolute -top-2 -right-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-8 h-8 text-rose-500 animate-spin drop-shadow-lg" style={{ animationDuration: "3s" }} />
            </div>
            <div className="absolute inset-0 text-5xl font-bold text-rose-500/20 blur-lg animate-pulse">
              BucksDash
            </div>
          </div>

          <div className="relative group">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-800/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
              <Mail className="h-10 w-10 text-rose-600 dark:text-rose-400 animate-pulse" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-rose-400/20 to-rose-500/20 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">
            Reset your password
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-rose-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-4">
              <div className="group">
                <Label htmlFor="email" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                  <span>Email address</span>
                  <Mail className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-rose-500 focus:ring-rose-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md"
                    placeholder="Enter your email address"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-700 hover:via-rose-700 hover:to-rose-800 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group text-lg"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send reset email</span>
                    <Shield className="w-5 h-5 animate-pulse" />
                  </>
                )}
              </span>
            </Button>
          </form>
        </div>

        {/* Bottom Links & Error Dialog */}
        <div className="text-center space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors duration-300 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Login
          </Link>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors duration-300 relative group"
            >
              Sign up
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </p>

          <p className="text-sm">
            <Link
              href="/"
              className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors duration-300 inline-flex items-center group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
          </p>

          {/* Error Dialog */}
          <Dialog open={errorDialog.isOpen} onOpenChange={closeErrorDialog}>
            <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent rounded-2xl" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-rose-600 dark:text-rose-400 flex items-center space-x-2 text-xl">
                  <Shield className="w-5 h-5" />
                  <span>{errorDialog.title}</span>
                </DialogTitle>
                <DialogDescription className="text-gray-700 dark:text-gray-300 text-base">
                  {errorDialog.message}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="relative z-10">
                <Button
                  variant="outline"
                  onClick={closeErrorDialog}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}