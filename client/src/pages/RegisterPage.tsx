import { useState } from "react"
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created successfully 🎉", {
        description: "Redirecting to login...",
      });

      setForm({ username: "", email: "", password: "" });

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid =
    form.username.length >= 3 &&
    form.email.includes("@") &&
    form.password.length >= 4;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0f172a] via-[#0b1120] to-[#111827] px-4">
      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-2xl rounded-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-white font-semibold">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-400">
            Join PantryAI and start collaborating
          </CardDescription>
        </CardHeader>

        <form onSubmit={onRegister}>
          <CardContent className="space-y-5">
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="username"
                  placeholder="Enter Name"
                  value={form.username}
                  onChange={handleChange}
                  className="pl-10 bg-slate-800/70 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10 bg-slate-800/70 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  className="pl-10 bg-slate-800/70 border border-slate-700 text-white"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="mt-6 flex flex-col gap-4">
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-all"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}