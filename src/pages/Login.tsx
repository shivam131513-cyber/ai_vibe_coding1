import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
    const navigate = useNavigate();
    const { signInWithPassword, signUp, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isSignUp) {
                await signUp(email, password);
                // After successful signup, switch to login mode
                setIsSignUp(false);
                setPassword("");
            } else {
                await signInWithPassword(email, password);
                navigate("/dashboard");
            }
        } catch (error) {
            // Error handling is done in AuthContext
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Login Card */}
            <Card className="relative w-full max-w-md">
                <CardHeader className="space-y-4">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Shield className="h-7 w-7" />
                            </div>
                            <span className="font-display text-2xl font-bold">CivicGuard</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <CardTitle className="text-2xl">
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </CardTitle>
                        <CardDescription>
                            {isSignUp
                                ? "Sign up to start reporting civic issues"
                                : "Sign in to your account to continue"}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <User size={18} />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Lock size={18} />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10 pr-12"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {isSignUp && (
                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 6 characters
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                        </Button>
                    </form>

                    {/* Demo Credentials (only show on login) */}
                    {!isSignUp && (
                        <div className="mt-4 bg-muted rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <User size={14} className="text-primary" />
                                <span>Demo Credentials</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="font-mono">demo@civicguard.ai</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Password:</span>
                                    <span className="font-mono">demo123</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Toggle Sign Up/Sign In */}
                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">
                            {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-primary hover:underline font-medium"
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Secure authentication powered by Supabase
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Note */}
            <p className="absolute bottom-4 text-center text-xs text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
        </div>
    );
}
