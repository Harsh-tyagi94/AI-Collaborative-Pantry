import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { registerUserSchema } from "@/schemas/auth.schema.ts";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export default function RegisterUserForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = registerUserSchema.safeParse(form);
      if (!result.success) {
        toast.error(result.error.issues[0].message);
        return;
      }
      const response = await fetch(
        "http://localhost:8000/api/v1/users/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created successfully 🎉", {
        description: "Redirecting to login...",
      });

      setForm({
        username: "",
        email: "",
        password: "",
      });

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
    <form onSubmit={onRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-gray-300">
          Username
        </Label>

        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

          <Input
            id="username"
            placeholder="Enter username"
            value={form.username}
            onChange={handleChange}
            className="pl-10 bg-[#1a1a1f] border-[#2a2a33] text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email
        </Label>

        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

          <Input
            id="email"
            type="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            className="pl-10 bg-[#1a1a1f] border-[#2a2a33] text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">
          Password
        </Label>

        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            className="pl-10 bg-[#1a1a1f] border-[#2a2a33] text-white"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full bg-[#9929EA] hover:bg-[#7c1cd1] text-white"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <>
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
