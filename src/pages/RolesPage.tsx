import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import PageHeader from "../components/ui/PageHeader";
import ConfirmDeleteButton from "../components/ui/ConfirmDeleteButton";
import { toArray } from "../utils/api";

export default function RolesPage() {
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<any>(null); const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [permissionIds, setPermissionIds] = useState<number[]>([]);
  const rolesQuery = useQuery({
      queryKey: ["roles"],
      queryFn: async () => {
        const res = await api.get("/roles");
        return toArray(res.data);
      },
  }); 
  const permissionsQuery = useQuery({
      queryKey: ["permissions"],
      queryFn: async () => {
        const res = await api.get("/permissions");
        return toArray(res.data);
      },
  }); 
  const permissionOptions = permissionsQuery.data || []; const selectedCodes = useMemo(() => new Set(permissionIds), [permissionIds]);
  const resetForm = () => { setName(""); setDescription(""); setPermissionIds([]); setEditing(null); };
  const openAdd = () => { resetForm(); setOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setName(item.name); setDescription(item.description || ""); setPermissionIds(item.permissions.map((x: any) => x.permissionId)); setOpen(true); };
  const submit = async () => { const payload = { name, description, permissionIds }; if (editing?.id) await api.put(`/roles/${editing.id}`, payload); else await api.post(`/roles`, payload); setOpen(false); resetForm(); await rolesQuery.refetch(); };
  const removeRole = async (id: number) => { await api.delete(`/roles/${id}`); await rolesQuery.refetch(); };
  return <div><PageHeader title="Roles & Permissions" buttonText="Add Role" onClick={openAdd} /><div className="overflow-auto rounded-xl bg-white shadow"><table className="w-full"><thead><tr className="bg-slate-100"><th className="p-3 text-left">Role</th><th className="p-3 text-left">Description</th><th className="p-3 text-left">Permissions</th><th className="p-3 text-left">Actions</th></tr></thead><tbody>{(rolesQuery.data || []).map((item: any) => <tr key={item.id} className="border-t"><td className="p-3">{item.name}</td><td className="p-3">{item.description || "-"}</td><td className="p-3"><div className="flex flex-wrap gap-1">{item.permissions.map((perm: any) => <span key={perm.id} className="rounded bg-slate-200 px-2 py-1 text-xs">{perm.permission.code}</span>)}</div></td><td className="p-3"><div className="flex gap-2"><button className="rounded bg-amber-500 px-3 py-1 text-white" onClick={() => openEdit(item)}>Edit</button><ConfirmDeleteButton onConfirm={() => removeRole(item.id)} /></div></td></tr>)}</tbody></table></div>{open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b px-6 py-4"><h3 className="text-lg font-semibold">{editing ? "Edit Role" : "Add Role"}</h3><button onClick={() => setOpen(false)} className="text-xl">×</button></div><div className="grid grid-cols-1 gap-4 p-6"><input className="rounded border p-3" placeholder="Role Name" value={name} onChange={(e) => setName(e.target.value)} /><textarea className="rounded border p-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /><div><div className="mb-2 font-medium">Permissions</div><div className="grid grid-cols-1 gap-2 md:grid-cols-2">{permissionOptions.map((perm: any) => <label key={perm.id} className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={selectedCodes.has(perm.id)} onChange={(e) => { if (e.target.checked) setPermissionIds((prev) => [...prev, perm.id]); else setPermissionIds((prev) => prev.filter((x) => x !== perm.id)); }} /><span>{perm.code}</span></label>)}</div></div><div className="flex justify-end gap-3"><button className="rounded border px-4 py-2" onClick={() => setOpen(false)}>Cancel</button><button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={submit}>Save</button></div></div></div></div>}</div>;
}
