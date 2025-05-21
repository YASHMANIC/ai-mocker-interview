"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmailStore } from "@/store/store";
import { removeToken, sendVerification } from "@/actions/sendverification";
import generateToken from "@/context/otp";
import { toast } from "react-hot-toast";
import { LoginSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function SignIn() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setEmail, setUserId } = useEmailStore();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  // Example of how your login handler should set the cookie

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post("/api/authentication/login", {
        email: values.email,
        password: values.password,
      });

      if (response.status === 200 && response.data) {
        // Set store values first
        setEmail(values.email);
        setUserId(response.data.user.id);

        // Show success message
        toast.success("Login Successful");

        // Hard redirect to dashboard
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        setError("Please verify your email");
        toast.error("Please verify your email");
        await removeToken(values.email);
        await sendVerification(values.email, generateToken());
        router.push("/otpPage");
      } else if (error.response?.status === 401) {
        setError("Invalid credentials");
        toast.error("Invalid credentials");
      } else {
        setError("An error occurred during login");
        toast.error("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-500">
      <h1 className="text-4xl font-bold text-white mb-6">Sign-In</h1>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">
            Email
          </label>
          <input
            {...form.register("email")}
            type="email"
            className="mt-1 block w-full p-2 border border-gray-300 rounded text-gray-950"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">
            Password
          </label>
          <input
            {...form.register("password")}
            type="password"
            className="mt-1 block w-full p-2 border border-gray-300 rounded text-gray-950"
          />
        </div>
        {error && (
          <p className="text-white bg-red-400 rounded-lg text-center mb-4 w-full text-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-white bg-emerald-400 rounded-lg text-center mb-4 w-full text-lg">
            {success}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full items-center cursor-pointer"
        >
          <div className="flex items-center justify-center  text-white font-bold">
            {loading ? "Loading..." : "Login"}
          </div>
        </Button>
        <div className="flex items-center justify-between mt-2 text-center">
          <p className="text-gray-950 mt-4 text-sm w-full">
            Don't have an account?{" "}
            <a href="/" className="text-blue-700 hover:underline">
              Register
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
