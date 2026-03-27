import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import EmployeeModal from "../components/modals/EmployeeModal";
import ConfirmDeleteButton from "../components/ui/ConfirmDeleteButton";
import PageHeader from "../components/ui/PageHeader";
import { Employee } from "../types";
export default function EmployeesPage() {
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<Employee | undefined>(undefined);
  const employeesQuery = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data });
  const departmentsQuery = useQuery({ queryKey: ["departments"], queryFn: async () => (await api.get("/departments")).data });
  const shiftsQuery = useQuery({ queryKey: ["shifts"], queryFn: async () => (await api.get("/shifts")).data });
  const removeItem = async (id: number) => { await api.delete(`/employees/${id}`); await employeesQuery.refetch(); };
  return <div><PageHeader title="Employees" buttonText="Add Employee" onClick={() => { setEditing(undefined); setOpen(true); }} /><div className="overflow-auto rounded-xl bg-white shadow"><table className="w-full"><thead><tr className="bg-slate-100"><th className="p-3 text-left">Code</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Department</th><th className="p-3 text-left">Shift</th><th className="p-3 text-left">Device User</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Actions</th></tr></thead><tbody>{(employeesQuery.data || []).map((item: Employee) => <tr key={item.id} className="border-t"><td className="p-3">{item.employeeCode}</td><td className="p-3">{item.firstName} {item.lastName}</td><td className="p-3">{item.department?.name || "-"}</td><td className="p-3">{item.shift?.name || "-"}</td><td className="p-3">{item.deviceUserId || "-"}</td><td className="p-3">{item.status}</td><td className="p-3"><div className="flex gap-2"><button className="rounded bg-amber-500 px-3 py-1 text-white" onClick={() => { setEditing(item); setOpen(true); }}>Edit</button><ConfirmDeleteButton onConfirm={() => removeItem(item.id)} /></div></td></tr>)}</tbody></table></div><EmployeeModal open={open} onClose={() => setOpen(false)} initialData={editing} departments={departmentsQuery.data || []} shifts={shiftsQuery.data || []} onSuccess={() => employeesQuery.refetch()} /></div>;
}
