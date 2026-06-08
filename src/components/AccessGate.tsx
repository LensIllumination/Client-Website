import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Lock } from "lucide-react";

type AccessGateProps = {
  title: string;
  description: string;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  submitting?: boolean;
  error?: string;
};

export default function AccessGate({
  title,
  description,
  password,
  onPasswordChange,
  onSubmit,
  submitting = false,
  error,
}: AccessGateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md shadow-xl border-muted-foreground/10">
        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter password"
              disabled={submitting}
              className="text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSubmit();
                }
              }}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : <p className="text-sm text-muted-foreground">This content is protected.</p>}
          </div>

          <Button onClick={onSubmit} disabled={submitting || !password.trim()} className="w-full gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Unlock
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
