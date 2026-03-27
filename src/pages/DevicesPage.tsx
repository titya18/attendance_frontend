import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import DeviceModal from "../components/modals/DeviceModal";
import ConfirmDeleteButton from "../components/ui/ConfirmDeleteButton";
import PageHeader from "../components/ui/PageHeader";
import { Device } from "../types";
export default function DevicesPage() {
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<Device | undefined>(undefined);
  const query = useQuery({ queryKey: ["devices"], queryFn: async () => (await api.get("/devices")).data });
  const removeItem = async (id: number) => { await api.delete(`/devices/${id}`); await query.refetch(); };
  const syncDevice = async (id: number) => { const res = await api.post(`/devices/${id}/sync`); alert(res.data.message || "Device synced successfully"); await query.refetch(); };
  const testConnection = async (id: number) => { const res = await api.post(`/devices/${id}/test-connection`); alert(res.data.message || "Connection successful"); };
  return <div><PageHeader title="Devices" buttonText="Add Device" onClick={() => { setEditing(undefined); setOpen(true); }} /><div className="overflow-auto rounded-xl bg-white shadow"><table className="w-full"><thead><tr className="bg-slate-100"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Vendor</th><th className="p-3 text-left">IP / URL</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Last Sync</th><th className="p-3 text-left">Actions</th></tr></thead><tbody>{(query.data || []).map((item: Device) => <tr key={item.id} className="border-t"><td className="p-3">{item.name}</td><td className="p-3">{item.vendor}</td><td className="p-3">{item.baseUrl || `${item.ipAddress || "-"}${item.port ? `:${item.port}` : ""}`}</td><td className="p-3">{item.deviceType}</td><td className="p-3">{item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleString() : "-"}</td><td className="p-3"><div className="flex flex-wrap gap-2"><button className="rounded bg-sky-600 px-3 py-1 text-white" onClick={() => testConnection(item.id)}>Test</button><button className="rounded bg-green-600 px-3 py-1 text-white" onClick={() => syncDevice(item.id)}>Sync</button><button className="rounded bg-amber-500 px-3 py-1 text-white" onClick={() => { setEditing(item); setOpen(true); }}>Edit</button><ConfirmDeleteButton onConfirm={() => removeItem(item.id)} /></div></td></tr>)}</tbody></table></div><DeviceModal open={open} onClose={() => setOpen(false)} initialData={editing} onSuccess={() => query.refetch()} /></div>;
}
