import { useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { CardContent, CardFooter } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Mail, Lock, Loader2 } from "lucide-react";
import { loginUserSchema } from "@/schemas/auth.schema";

import { useDispatch } from "react-redux";
import { setUser, setAuthLoad } from "@/store/slices/authSlice";

export default function LoginUserForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  }

  async function handleLogin() {
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);

      const result = loginUserSchema.safeParse(formData);

      if (!result.success) {
        toast.error(result.error.issues[0].message);
        return;
      }

      const response = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      // 1. Always parse the JSON, even for errors (404, 401, etc.)
      const data = await response.json();

      // 2. If the response is not 2xx, throw the message from the backend
      if (!response.ok) {
        // This 'data.message' matches the 'message' key in your backend error middleware
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("accessToken", data.data.accessToken);
      // console.log("user from API:", data.data.user);
      dispatch(setUser(data.data.user)); // assuming data.data.user matches your User interface
      dispatch(setAuthLoad()); // set loading to false

      toast.success("Login successful 🎉");
      navigate("/dashboard");
      
    } catch (error: any) {
      // 4. This will now receive "User does not exist" from the throw above
      console.error("Frontend Error Catch:", error.message);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <CardContent className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">
            Email
          </Label>

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />

            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 bg-slate-950/60 border-white/10 text-white focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">
            Password
          </Label>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />

            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 bg-slate-950/60 border-white/10 text-white focus-visible:ring-indigo-500"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-6 pt-6">
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {isLoading ? "Logging in..." : "Sign In"}
        </Button>

        <p className="text-sm text-slate-400">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Create one
          </span>
        </p>
      </CardFooter>
    </>
  );
}
