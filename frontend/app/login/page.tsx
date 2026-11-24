"use client";

import React, { useCallback, useState, useEffect, FormEvent, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import {
  GraduationCap,
  BookOpenCheck,
  Building2,
  Wrench,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useAuth, normalizeRole, getDashboardPathForRole } from "@/context/AuthContext";

type AuthTab = "signin" | "signup" | "forgot";

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
      }) => void;
      prompt: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

const DEMO_ACCOUNTS = [
  {
    role: "student",
    label: "Student",
    name: "Aarav Sharma",
    email: "student@nitx.demo",
    password: "Student@123",
    icon: GraduationCap,
    desc: "Academic radar, 75% attendance forecaster & peer study",
    color: "from-amber-50 to-white text-slate-800 border-amber-200/90 hover:border-amber-400 hover:shadow-md",
  },
  {
    role: "faculty",
    label: "Faculty",
    name: "Prof. Vikram Sen",
    email: "faculty@nitx.demo",
    password: "Faculty@123",
    icon: BookOpenCheck,
    desc: "Relative grading sandbox, IRT item audit & at-risk alerts",
    color: "from-amber-50 to-white text-slate-800 border-amber-200/90 hover:border-amber-400 hover:shadow-md",
  },
  {
    role: "admin",
    label: "Admin",
    name: "Chief Administrator",
    email: "admin@nitx.demo",
    password: "Admin@123",
    icon: Building2,
    desc: "Campus overview, ARR billing, NBA outcomes & SLA desk",
    color: "from-amber-50 to-white text-slate-800 border-amber-200/90 hover:border-amber-400 hover:shadow-md",
  },
  {
    role: "other",
    label: "Other / Staff",
    name: "Sunil Verma (Warden)",
    email: "staff@nitx.demo",
    password: "Staff@123",
    icon: Wrench,
    desc: "Facilities triage desk, hash-chained ledger & campus logistics",
    color: "from-amber-50 to-white text-slate-800 border-amber-200/90 hover:border-amber-400 hover:shadow-md",
  },
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const demoParam = searchParams.get("demo");

  const { user, isAuthenticated, isLoading: authLoading, login, loginWithGoogle, register, forgotPassword, resetPassword } = useAuth();

  const [tab, setTab] = useState<AuthTab>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleInitialized = useRef(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [emailInputUnlocked, setEmailInputUnlocked] = useState(false);
  const [passwordInputUnlocked, setPasswordInputUnlocked] = useState(false);

  // Sign Up state (Admin role is strictly excluded from public registration)
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpRole, setSignUpRole] = useState<"student" | "faculty" | "other">("student");
  const [signUpDept, setSignUpDept] = useState("CSE");

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request");

  // Redirect authenticated user immediately to their dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const target = redirectParam || getDashboardPathForRole(user.role);
      router.replace(target);
    }
  }, [isAuthenticated, user, authLoading, router, redirectParam]);

  useEffect(() => {
    if (authLoading || isAuthenticated || !demoParam) return;

    const account = DEMO_ACCOUNTS.find((item) => item.role === demoParam);
    if (!account) return;

    setBusy(true);

    login(account.email, account.password, "NITX")
      .then((loggedUser) => {
        const target = redirectParam || getDashboardPathForRole(loggedUser.role);
        setSuccessMsg(`Authenticated as ${account.label}. Redirecting...`);
        router.replace(target);
      })
      .catch((err: any) => {
        setErrorMsg(err.message || "Quick demo login failed.");
      })
      .finally(() => setBusy(false));
  }, [authLoading, isAuthenticated, demoParam, login, redirectParam, router]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signInEmail.trim() || !signInPassword) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setBusy(true);
    try {
      const loggedUser = await login(signInEmail.trim(), signInPassword, "NITX");
      setSuccessMsg(`Welcome back, ${loggedUser.full_name || loggedUser.email}! Redirecting...`);
      const target = redirectParam || getDashboardPathForRole(loggedUser.role);
      setTimeout(() => router.push(target), 400);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleCredential = useCallback(async (response: { credential?: string }) => {
    if (!response.credential) {
      setErrorMsg("Google did not return a sign-in credential. Please try again.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
    try {
      const loggedUser = await loginWithGoogle(response.credential);
      setSuccessMsg(`Welcome back, ${loggedUser.full_name || loggedUser.email}! Redirecting...`);
      router.replace(redirectParam || getDashboardPathForRole(loggedUser.role));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [loginWithGoogle, redirectParam, router]);

  const handleGoogleSignIn = () => {
    setErrorMsg(null);
    if (!googleClientId) {
      setErrorMsg("Google sign-in is not configured yet. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable it.");
      return;
    }

    const google = window.google;
    if (!google?.accounts?.id || !googleInitialized.current) {
      setErrorMsg("Google sign-in is still loading. Please try again in a moment.");
      return;
    }

    google.accounts.id.prompt();
  };

  useEffect(() => {
    if (!googleClientId || googleInitialized.current) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || googleInitialized.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      googleInitialized.current = true;
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", initializeGoogle, { once: true });
      initializeGoogle();
      return () => existingScript.removeEventListener("load", initializeGoogle);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => setErrorMsg("Could not load Google sign-in. Check your connection and try again.");
    document.head.appendChild(script);
    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [googleClientId, handleGoogleCredential]);

  const handleQuickDemoLogin = async (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);

    try {
      const loggedUser = await login(acc.email, acc.password, "NITX");
      setSuccessMsg(`Authenticated as ${acc.label} (${loggedUser.full_name}). Redirecting...`);
      const target = redirectParam || getDashboardPathForRole(loggedUser.role);
      setTimeout(() => router.push(target), 300);
    } catch (err: any) {
      setErrorMsg(err.message || "Quick demo login failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      await register({
        full_name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        role: signUpRole,
        department: signUpDept,
        college_code: "NITX",
      });
      setSuccessMsg("Account created successfully! You are now logged in.");
      const target = redirectParam || getDashboardPathForRole(signUpRole);
      setTimeout(() => router.push(target), 500);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please check your inputs.");
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPasswordRequest = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotEmail.trim()) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    setBusy(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      setSuccessMsg(res.message || "Password reset token generated.");
      if (res.reset_token) {
        setResetToken(res.reset_token);
        setForgotStep("reset");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process forgot password request.");
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetToken.trim() || !newPassword) {
      setErrorMsg("Reset token and new password are required.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      await resetPassword({
        email: forgotEmail.trim(),
        token: resetToken.trim(),
        new_password: newPassword,
      });
      setSuccessMsg("Password reset successfully! Please sign in with your new password.");
      setSignInEmail(forgotEmail);
      setSignInPassword("");
      setTimeout(() => {
        setTab("signin");
        setForgotStep("request");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Please verify your token.");
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-amber-700">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs tracking-wider text-slate-600 uppercase font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#F4EFE6] to-[#EAE0D0] text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Decorative ambient warm light flares */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      {/* Main Login / Signup Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Platform Branding & 1-Click Demo Accounts */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold mb-3 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>One Campus. One Intelligence.</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Enterprise Access <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600">
                  Role-Based Portal
                </span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Log in to your personalized workspace. Students, faculty, campus administrators, and operations staff are automatically routed to their authorized dashboards.
              </p>
            </div>

            {/* Quick 1-Click Demo Logins */}
            <div className="bg-white/90 border border-amber-200/90 rounded-2xl p-4 backdrop-blur-xl shadow-lg shadow-amber-950/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  ⚡ 1-Click Demo Accounts
                </span>
                <span className="text-[10px] text-amber-700 font-mono font-medium">Bcrypt Authenticated</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      disabled={busy}
                      onClick={() => handleQuickDemoLogin(acc)}
                      className={`text-left p-3 rounded-xl border transition-all duration-200 bg-gradient-to-br ${acc.color} hover:scale-[1.02] hover:shadow-md disabled:opacity-50 group`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 shrink-0 text-amber-700" />
                        <span className="text-xs font-bold text-amber-900">{acc.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-900 font-bold truncate">{acc.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{acc.email}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-slate-600">
                <span>All accounts use password:</span>
                <span className="font-mono bg-amber-100 px-2 py-0.5 rounded border border-amber-300 text-amber-900 text-[10px] font-semibold">
                  [Role]@123
                </span>
              </div>
            </div>

            {/* Security Assurance Badges */}
            <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Bcrypt Hash</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>JWT Sessions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Server-Side RBAC</span>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-white/95 border border-amber-200/90 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl shadow-amber-950/10 relative">
              {/* Form Tab Switcher */}
              <div className="flex items-center gap-2 p-1 bg-amber-50/80 border border-amber-200/80 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    tab === "signin"
                      ? "bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("signup");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    tab === "signup"
                      ? "bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Register Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("forgot");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    tab === "forgot"
                      ? "bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Reset Password
                </button>
              </div>

              {/* Status Alerts */}
              {errorMsg && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 1: SIGN IN */}
              {/* ============================================================== */}
              {tab === "signin" && (
                <form onSubmit={handleSignIn} autoComplete="off" className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        name="login-email"
                        autoComplete="off"
                        readOnly={!emailInputUnlocked}
                        onFocus={() => setEmailInputUnlocked(true)}
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setTab("forgot");
                          setForgotEmail(signInEmail);
                        }}
                        className="text-[11px] text-amber-700 font-medium hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="login-password"
                        autoComplete="new-password"
                        readOnly={!passwordInputUnlocked}
                        onFocus={() => setPasswordInputUnlocked(true)}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {busy ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative py-1" aria-hidden="true">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-[#0F1527] dark:text-slate-300">OR CONTINUE WITH</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-[10px] rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.62 5.91c4.45-4.11 7.15-10.16 7.15-17.56Z" />
                      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.26-8.28 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <div className="pt-2 text-center text-[11px] text-slate-500">
                    New to CAMPUS-NEXUS?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("signup")}
                      className="text-amber-700 font-semibold hover:underline"
                    >
                      Create an account
                    </button>
                  </div>
                </form>
              )}

              {/* ============================================================== */}
              {/* TAB 2: SIGN UP */}
              {/* ============================================================== */}
              {tab === "signup" && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Diya Sen"
                        className="w-full bg-slate-50/80 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="e.g. diya.sen@nitx.demo"
                        className="w-full bg-slate-50/80 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Public Role Selector (Admin is strictly disallowed) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Select Role <span className="text-slate-500 font-normal">(Admin is invitation-only)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignUpRole("student")}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                          signUpRole === "student"
                            ? "bg-amber-100/90 border-amber-500 text-amber-900 font-bold shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300"
                        }`}
                      >
                        <GraduationCap className="w-4 h-4 text-amber-700" />
                        <span>Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignUpRole("faculty")}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                          signUpRole === "faculty"
                            ? "bg-amber-100/90 border-amber-500 text-amber-900 font-bold shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300"
                        }`}
                      >
                        <BookOpenCheck className="w-4 h-4 text-sky-600" />
                        <span>Faculty</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignUpRole("other")}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                          signUpRole === "other"
                            ? "bg-amber-100/90 border-amber-500 text-amber-900 font-bold shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300"
                        }`}
                      >
                        <Wrench className="w-4 h-4 text-pink-600" />
                        <span>Other (Staff)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Department</label>
                      <select
                        value={signUpDept}
                        onChange={(e) => setSignUpDept(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                      >
                        <option value="CSE">Computer Science (CSE)</option>
                        <option value="ECE">Electronics (ECE)</option>
                        <option value="Facilities">Facilities & Operations</option>
                        <option value="Administration">General Academics</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full bg-slate-50/80 border border-slate-300 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Toggle password visibility"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {busy ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Registering Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account & Enter</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-1 text-[11px] text-slate-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("signin")}
                      className="text-amber-700 font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* ============================================================== */}
              {/* TAB 3: FORGOT PASSWORD */}
              {/* ============================================================== */}
              {tab === "forgot" && (
                <div className="space-y-4">
                  {forgotStep === "request" ? (
                    <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Enter your registered email address. We will generate a secure one-time password reset token for your account.
                      </p>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Registered Email</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="you@nitx.demo"
                            className="w-full bg-slate-50/80 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={busy}
                          className="w-full bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50"
                        >
                          {busy ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              <span>Generating Token...</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4" />
                              <span>Request Reset Token</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Reset Token</label>
                        <input
                          type="text"
                          required
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value)}
                          placeholder="e.g. rst-abc123xyz"
                          className="w-full bg-slate-50/80 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">New Password</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full bg-slate-50/80 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={busy}
                          className="w-full bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50"
                        >
                          {busy ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Set New Password & Sign In</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="text-center pt-2 text-[11px] text-slate-500">
                    Remembered your password?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("signin")}
                      className="text-amber-700 font-semibold hover:underline"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-amber-900/10 py-4 px-6 text-center text-xs text-slate-500 backdrop-blur-md bg-white/70">
        <p>
          CAMPUS-NEXUS · Enterprise Cognitive Campus OS · Multi-Tenant Architecture · Demo seeded for Northstar Institute of Technology
        </p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-amber-700">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs tracking-wider text-slate-600 uppercase font-medium">Loading Portal...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
