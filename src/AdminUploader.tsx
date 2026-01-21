import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, addDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { toast } from "sonner";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, CheckCircle2, AlertCircle, LogIn, LogOut } from "lucide-react";

const WORKER_URL = "https://b2-proxy.lensillumination.workers.dev";

export default function AdminUploader() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [albumId, setAlbumId] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    } catch (error: any) {
      console.error("Sign in error:", error.code, error.message);
      toast.error("Please try again later");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAlbumId("");
      setFiles(null);
      toast.success("Signed out successfully!");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Please try again later");
    }
  };

  const handleUpload = async () => {
    if (!files || !albumId) {
      console.error("Upload validation failed: missing files or album ID");
      toast.error("Please try again later");
      return;
    }

    setIsUploading(true);
    setOverallProgress(0);
    
    const fileArray = Array.from(files);
    let completedCount = 0;

    // We use a promise-based loop to handle uploads sequentially
    for (const file of fileArray) {
      const toastId = toast.loading(`Uploading ${file.name}...`);
      
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User session not found.");

        // 1. Get fresh ID Token for the Worker gatekeeper
        const idToken = await user.getIdToken(true);
        
        // 2. Format name: timestamp-slugified-name.ext
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
        const fileName = `${Date.now()}-${safeName}`;

        // 3. PUT to Cloudflare Worker
        const b2Res = await fetch(`${WORKER_URL}/${fileName}`, {
          method: "PUT",
          body: file,
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": file.type,
          },
        });

        if (!b2Res.ok) {
          const errorText = await b2Res.text();
          throw new Error(errorText || "Worker upload failed");
        }

        // 4. Create record in 'images' collection
        const imgRef = await addDoc(collection(db, "images"), {
          name: file.name,
          "file-name": fileName,
          uploadedAt: new Date(),
          size: file.size,
          type: file.type
        });

        // 5. Update the Album's array of image references
        const albumRef = doc(db, "albums", albumId);
        await updateDoc(albumRef, {
          images: arrayUnion(imgRef),
        });

        completedCount++;
        setOverallProgress((completedCount / fileArray.length) * 100);
        
        toast.success(`Success: ${file.name}`, {
          id: toastId,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });

      } catch (error: any) {
        console.error("File upload error:", file.name, error);
        toast.error("Please try again later", {
          id: toastId,
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        });
      }
    }

    setIsUploading(false);
    
    if (completedCount === 0) {
      console.error("All uploads failed:", fileArray.length, "files");
      toast.error("Please try again later");
    } else if (completedCount === fileArray.length) {
      toast.success("Upload complete", {
        description: `Successfully uploaded all ${completedCount} file(s).`,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFiles(null);
    } else {
      toast.warning("Partial upload", {
        description: `Successfully uploaded ${completedCount} of ${fileArray.length} file(s).`,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      {loading ? (
        <Card className="w-full max-w-lg shadow-lg border-muted-foreground/10">
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : !user ? (
        <Card className="w-full max-w-sm sm:max-w-lg shadow-lg border-muted-foreground/10">
          <CardHeader className="space-y-2 sm:space-y-1">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Admin Sign In
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Sign in to access the media uploader.
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
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-sm sm:max-w-lg shadow-lg border-muted-foreground/10">
          <CardHeader className="space-y-2 sm:space-y-1 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <UploadCloud className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Media Uploader
            </CardTitle>
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground break-all">{user?.email}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="text-xs sm:text-sm h-8 sm:h-7 justify-start sm:justify-center"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Logout
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="albumId" className="text-sm sm:text-base">Album Name</Label>
              <Input 
                id="albumId"
                placeholder="My Album" 
                value={albumId} 
                onChange={(e) => setAlbumId(e.target.value)} 
                disabled={isUploading}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pictures" className="text-sm sm:text-base">Select Photos</Label>
              <Input 
                ref={fileInputRef}
                id="pictures"
                type="file" 
                multiple 
                accept="image/*"
                onChange={(e) => setFiles(e.currentTarget.files)} 
                disabled={isUploading}
                className="file:text-primary file:font-semibold cursor-pointer text-base"
              />
            </div>

            {isUploading && (
              <div className="space-y-2 sm:space-y-3 pt-2">
                <div className="flex justify-between text-xs sm:text-sm font-medium text-muted-foreground">
                  <span>Batch Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2 w-full" />
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !files || !albumId} 
              className="w-full font-bold transition-all text-base py-6"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Queue...
                </>
              ) : (
                "Upload to Cloud"
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}