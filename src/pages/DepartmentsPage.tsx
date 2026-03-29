import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import DepartmentModal from "../components/modals/DepartmentModal";
import ConfirmDeleteButton from "../components/ui/ConfirmDeleteButton";
import PageHeader from "../components/ui/PageHeader";
import { Department } from "../types";
import { toArray } from "../utils/api";
export default function DepartmentsPage() {
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<Department | undefined>(undefined);
  const query = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await api.get("/departments");
      return toArray(res.data);
    },
  });
  const removeItem = async (id: number) => { await api.delete(`/departments/${id}`); await query.refetch(); };
  return <div><PageHeader title="Departments" buttonText="Add Department" onClick={() => { setEditing(undefined); setOpen(true); }} /><div className="overflow-auto rounded-xl bg-white shadow"><table className="w-full"><thead><tr className="bg-slate-100"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Description</th><th className="p-3 text-left">Actions</th></tr></thead><tbody>{(query.data || []).map((item: Department) => <tr key={item.id} className="border-t"><td className="p-3">{item.name}</td><td className="p-3">{item.description || "-"}</td><td className="p-3"><div className="flex gap-2"><button className="rounded bg-amber-500 px-3 py-1 text-white" onClick={() => { setEditing(item); setOpen(true); }}>Edit</button><ConfirmDeleteButton onConfirm={() => removeItem(item.id)} /></div></td></tr>)}</tbody></table></div><DepartmentModal open={open} onClose={() => setOpen(false)} initialData={editing} onSuccess={() => query.refetch()} /></div>;
}
