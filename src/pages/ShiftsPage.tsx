import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import ShiftModal from "../components/modals/ShiftModal";
import ConfirmDeleteButton from "../components/ui/ConfirmDeleteButton";
import PageHeader from "../components/ui/PageHeader";
import { Shift } from "../types";
import { toArray } from "../utils/api";
export default function ShiftsPage() {
  const [open, setOpen] = useState(false); 
  const [editing, setEditing] = useState<Shift | undefined>(undefined);
  const query = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => {
      const res = await api.get("/shifts");
      return toArray(res.data);
    },
  });
  const removeItem = async (id: number) => { await api.delete(`/shifts/${id}`); await query.refetch(); };
  return <div><PageHeader title="Shifts" buttonText="Add Shift" onClick={() => { setEditing(undefined); setOpen(true); }} /><div className="overflow-auto rounded-xl bg-white shadow"><table className="w-full"><thead><tr className="bg-slate-100"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Start</th><th className="p-3 text-left">End</th><th className="p-3 text-left">Late After</th><th className="p-3 text-left">Early Out</th><th className="p-3 text-left">Actions</th></tr></thead><tbody>{(query.data || []).map((item: Shift) => <tr key={item.id} className="border-t"><td className="p-3">{item.name}</td><td className="p-3">{item.startTime}</td><td className="p-3">{item.endTime}</td><td className="p-3">{item.lateAfterMin} min</td><td className="p-3">{item.earlyOutMin} min</td><td className="p-3"><div className="flex gap-2"><button className="rounded bg-amber-500 px-3 py-1 text-white" onClick={() => { setEditing(item); setOpen(true); }}>Edit</button><ConfirmDeleteButton onConfirm={() => removeItem(item.id)} /></div></td></tr>)}</tbody></table></div><ShiftModal open={open} onClose={() => setOpen(false)} initialData={editing} onSuccess={() => query.refetch()} /></div>;
}
