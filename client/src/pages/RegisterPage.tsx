import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth.js";
import { extractErrorMessage } from "../services/api.js";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or less")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    try {
      await registerAuth(data);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Registration failed. Please try again."));
    }
  };

  return (
    <div>
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-bold text-matte-50 font-mono tracking-tight flex items-center justify-between">
          <span>Create Account</span>
          <span className="text-[10px] uppercase font-normal px-2 py-0.5 rounded-full bg-matte-850 text-sage-300 border border-matte-750">
            Version Control
          </span>
        </h2>
        <p className="text-xs text-matte-400 font-sans">
          Join teams practicing structured version control
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-2 font-mono">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 font-mono">
        {/* Username */}
        <div>
          <label className="block text-xs font-medium text-matte-300 mb-1.5">
            Username
          </label>
          <div className="relative">
            <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-matte-500" />
            <input
              type="text"
              placeholder="developer_id"
              {...register("username")}
              className="w-full bg-matte-950 border border-matte-750 rounded-lg pl-9 pr-3 py-2 text-xs text-matte-100 placeholder:text-matte-600 focus:outline-none focus:border-sage-500 focus-visible:ring-2 focus-visible:ring-sage-400/40 transition"
              autoFocus
            />
          </div>
          {errors.username && (
            <p className="text-[11px] text-red-400 mt-1 font-sans">{errors.username.message}</p>
          )}
        </div>

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
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-400 mt-1 font-sans">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-matte-300 mb-1.5">
            Password (min 8 characters)
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
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account Free</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-matte-400 border-t border-matte-800/80 pt-4 font-mono">
        <span>Already have an account? </span>
        <Link to="/login" className="text-sage-400 hover:underline font-semibold">
          Sign in
        </Link>
      </div>
    </div>
  );
};
