import React, { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";

export default function AdminSignIn() {
  const [, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // If already signed in, redirect to admin dashboard
      if (currentUser) {
        navigate("/admin");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async () => {
    if (!signInEmail || !signInPassword) {
      console.error("Sign in validation failed: missing email or password");
      toast.error("Please try again later");
      return;
    }

    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      setSignInEmail("");
      setSignInPassword("");
      toast.success("Signed in successfully!");
      navigate("/admin");
    } catch (error: any) {
      console.error("Sign in error:", error.code, error.message);
      toast.error("Please try again later");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && signInEmail && signInPassword && !isSigningIn) {
      handleSignIn();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-lg shadow-lg border-muted-foreground/10">
        <CardHeader className="space-y-2 sm:space-y-1">
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Admin Sign In
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign in to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
            <Input 
              id="email"
              type="email"
              placeholder="admin@example.com" 
              value={signInEmail} 
              onChange={(e) => setSignInEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSigningIn}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
            <Input 
              id="password"
              type="password"
              placeholder="••••••••" 
              value={signInPassword} 
              onChange={(e) => setSignInPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSigningIn}
              className="text-base"
            />
          </div>

          <Button 
            onClick={handleSignIn} 
            disabled={isSigningIn || !signInEmail || !signInPassword} 
            className="w-full font-bold text-base py-6"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="pt-2 text-center">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
