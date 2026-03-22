import api from "@/lib/axios";

export type RegisterForm = {
  username: string;
  email: string;
  password: string;
};

export type LoginForm = {
  email: string;
  password: string;
};

export const registerUser = async (data: RegisterForm) => {
  const response = await api.post("/users/signup", data);
  return response.data;
};

export const loginUser = async (data: LoginForm) => {
  const response = await api.post("/users/login", data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/users/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/users/aboutme");
  return response.data;
};