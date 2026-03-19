import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, Film, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  onClose: () => void;
};

type Mode = "signin" | "signup" | "forgot";

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        onClose();
      }
    } else if (mode === "signup") {
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Check your email to verify.");
        onClose();
      }
    } else if (mode === "forgot") {
      // Use the site URL as redirect — always whitelisted by Supabase by default
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        setForgotSent(true);
      }
    }
    setLoading(false);
  };

  const titles: Record<Mode, string> = {
    signin: "SIGN IN",
    signup: "CREATE ACCOUNT",
    forgot: "RESET PASSWORD",
  };

  const subtitles: Record<Mode, string> = {
    signin: "Welcome back to CineTrack",
    signup: "Join CineTrack today",
    forgot: "We'll send you a reset link",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-md p-8 animate-scale-in shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {mode !== "signin" && (
          <button
            onClick={() => { setMode("signin"); setForgotSent(false); }}
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
            <Film className="text-gold" size={22} />
          </div>
          <div>
            <h2 className="font-display text-2xl text-foreground tracking-wider">
              {titles[mode]}
            </h2>
            <p className="text-muted-foreground text-xs mt-0.5">
              {subtitles[mode]}
            </p>
          </div>
        </div>

        {/* Forgot password — sent confirmation */}
        {mode === "forgot" && forgotSent ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto">
              <Mail className="text-gold" size={22} />
            </div>
            <p className="text-foreground font-medium">Check your inbox</p>
            <p className="text-muted-foreground text-sm">
              We sent a password reset link to <span className="text-foreground">{email}</span>.
              Click the link in the email to set a new password.
            </p>
            <button
              onClick={() => { setMode("signin"); setForgotSent(false); }}
              className="mt-4 text-gold text-sm hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {mode !== "forgot" && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              {mode === "signin" && (
                <div className="text-right -mt-1">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-muted-foreground hover:text-gold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-primary-foreground font-semibold py-3 rounded-xl hover:bg-gold/90 transition-all disabled:opacity-50 text-sm tracking-wide"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                  ? "Sign In"
                  : mode === "signup"
                  ? "Create Account"
                  : "Send Reset Link"}
              </button>
            </form>

            {mode !== "forgot" && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="text-gold hover:underline ml-1 font-medium"
                  >
                    {mode === "signin" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

