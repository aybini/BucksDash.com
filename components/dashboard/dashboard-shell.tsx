"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { UserNav } from "@/components/dashboard/user-nav";
import { checkNetworkStatus, reconnectToFirestore } from "@/lib/firebase-service";
import { WifiOff, RefreshCw } from "lucide-react";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();

  // 1) Auth state and loading come from the context
  const { user, loading } = useAuth();

  // 2) Offline/reconnect state
  const [isOffline, setIsOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  //
  // Hook #1: Redirect to /login once loading is false and user is null
  //
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  //
  // Hook #2: Network status / offline handling
  //
  useEffect(() => {
    const checkStatus = async () => {
      const online = checkNetworkStatus();
      setIsOffline(!online);
      if (online && isOffline) {
        handleReconnect();
      }
    };

    checkStatus();

    const handleOnline = () => {
      console.log("Browser reports online status");
      setIsOffline(false);
      handleReconnect();
    };

    const handleOffline = () => {
      console.log("Browser reports offline status");
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const interval = setInterval(checkStatus, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [isOffline]);

  //
  // These two early returns do NOT change hook order:
  //
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }

  // If loading is false but user is still null, we already pushed to /login.
  if (!user) {
    return null;
  }

  //
  // Now that we know: loading===false && user !== null, render the dashboard UI:
  //
  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      console.log("Attempting to reconnect to Firestore...");
      await reconnectToFirestore();
      console.log("Reconnection attempt completed");
    } catch (error) {
      console.error("Error during reconnection:", error);
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-rose-600">BucksDash</h1>
            {isOffline && (
              <div className="flex items-center text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </div>
            )}
            {isReconnecting && (
              <div className="flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Reconnecting...
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isOffline && !isReconnecting && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reconnect
              </Button>
            )}
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden pb-20 md:pb-16 pt-6">
          {children}
        </main>
      </div>

      <MobileNav />
      <OfflineBanner />
    </div>
  );
}
