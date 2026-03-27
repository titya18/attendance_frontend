import { NavLink, Outlet, useNavigate } from "react-router-dom";
export default function DashboardLayout() {
  const navigate = useNavigate();
  const menus = [
    { to: "/", label: "Dashboard" }, { to: "/employees", label: "Employees" }, { to: "/departments", label: "Departments" },
    { to: "/shifts", label: "Shifts" }, { to: "/devices", label: "Devices" }, { to: "/attendance-logs", label: "Attendance Logs" },
    { to: "/daily-attendance", label: "Daily Attendance" }, { to: "/face-attendance", label: "Face Attendance" }, { to: "/face-enroll", label: "Face Enroll" },
    { to: "/reports", label: "Reports" }, { to: "/roles", label: "Roles" },
  ];
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate(0); };
  return <div className="min-h-screen flex bg-gray-100"><aside className="w-64 bg-slate-900 text-white p-4"><h1 className="text-xl font-bold mb-6">Attendance System</h1><nav className="space-y-2">{menus.map((m)=><NavLink key={m.to} to={m.to} end={m.to==="/"} className={({isActive})=>`block rounded px-3 py-2 ${isActive?"bg-blue-600":"bg-slate-800 hover:bg-slate-700"}`}>{m.label}</NavLink>)}</nav><button onClick={logout} className="mt-6 w-full rounded bg-red-500 px-3 py-2 text-white">Logout</button></aside><main className="flex-1 p-6"><Outlet /></main></div>;
}
