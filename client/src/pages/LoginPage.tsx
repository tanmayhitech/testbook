import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth.js";
import { extractErrorMessage } from "../services/api.js";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, Sparkles } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      await login(data);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Invalid email or password"));
    }
  };

  return (
    <div>
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-bold text-matte-50 font-mono tracking-tight flex items-center justify-between">
          <span>Sign In</span>
          <span className="text-[10px] uppercase font-normal px-2 py-0.5 rounded-full bg-matte-850 text-sage-300 border border-matte-750">
            Version Control
          </span>
        </h2>
        <p className="text-xs text-matte-400 font-sans">
          Enter your credentials to access workspaces
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-2 font-mono">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-mono">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-matte-300 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-matte-500" />
            <input
              type="email"
              placeholder="student@college.edu"
              {...register("email")}
              className="w-full bg-matte-950 border border-matte-750 rounded-lg pl-9 pr-3 py-2 text-xs text-matte-100 placeholder:text-matte-600 focus:outline-none focus:border-sage-500 focus-visible:ring-2 focus-visible:ring-sage-400/40 transition"
              autoFocus
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-400 mt-1 font-sans">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-matte-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-matte-500" />
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full bg-matte-950 border border-matte-750 rounded-lg pl-9 pr-3 py-2 text-xs text-matte-100 placeholder:text-matte-600 focus:outline-none focus:border-sage-500 focus-visible:ring-2 focus-visible:ring-sage-400/40 transition"
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-400 mt-1 font-sans">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 px-4 bg-sage-400 hover:bg-sage-300 disabled:opacity-50 text-matte-950 text-xs font-semibold rounded-full transition flex items-center justify-center gap-2 shadow-sm focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:outline-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Workspace</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>

        {/* Instant Demo Student Login */}
        <button
          type="button"
          onClick={async () => {
            await login({ email: "tanmay@student.edu", password: "password123" });
            navigate("/dashboard");
          }}
          className="w-full py-2 px-3 bg-matte-850 hover:bg-matte-800 border border-matte-750 hover:border-matte-700 text-matte-300 hover:text-matte-100 text-[11px] font-medium rounded-full transition flex items-center justify-center gap-1.5"
        >
          <Sparkles size={12} className="text-sage-400" />
          <span>Demo Student Login (Instant Access)</span>
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-matte-400 border-t border-matte-800/80 pt-4 font-mono">
        <span>New to Testbook? </span>
        <Link to="/register" className="text-sage-400 hover:underline font-semibold">
          Create an account
        </Link>
      </div>
    </div>
  );
};
