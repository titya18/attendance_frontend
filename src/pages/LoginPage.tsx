import { useForm } from "react-hook-form";
import { api } from "../api/client";

type LoginForm = { username: string; password: string; };
export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginForm>({ defaultValues: { username: "admin", password: "admin123" } });
  const onSubmit = async (data: LoginForm) => { try { const res = await api.post("/auth/login", data); localStorage.setItem("token", res.data.token); localStorage.setItem("user", JSON.stringify(res.data.user)); window.location.href = "/"; } catch { alert("Invalid login"); } };
  return <div className="min-h-screen flex items-center justify-center bg-slate-100"><form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow w-full max-w-md space-y-4"><h2 className="text-2xl font-bold">Login</h2><input className="w-full border rounded p-3" placeholder="Username" {...register("username")} /><input className="w-full border rounded p-3" type="password" placeholder="Password" {...register("password")} /><button className="w-full bg-blue-600 text-white rounded p-3">Login</button></form></div>;
}
