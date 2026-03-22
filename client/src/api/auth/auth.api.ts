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

export const registerUserApi = async (data: RegisterForm) => {
  const response = await api.post("/users/signup", data);
  return response.data;
};

export const loginUserApi = async (data: LoginForm) => {
  const response = await api.post("/users/login", data);
  return response.data;
};

export const logoutUserApi = async () => {
  const response = await api.post("/users/logout");
  return response.data;
};

export const getCurrentUserApi = async () => {
  const response = await api.get("/users/aboutme");
  return response.data;
};