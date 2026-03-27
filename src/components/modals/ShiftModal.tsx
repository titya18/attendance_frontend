import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../api/client";
import { Shift } from "../../types";

type FormValues = { name: string; startTime: string; endTime: string; lateAfterMin: number; earlyOutMin: number; };
type Props = { open: boolean; onClose: () => void; initialData?: Shift; onSuccess?: () => void; };
export default function ShiftModal({ open, onClose, initialData, onSuccess }: Props) {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  useEffect(() => { if (!open) return; if (initialData) reset(initialData); else reset({ name: "", startTime: "08:00", endTime: "17:00", lateAfterMin: 0, earlyOutMin: 0 }); }, [open, initialData, reset]);
  const onSubmit = async (data: FormValues) => { if (initialData?.id) await api.put(`/shifts/${initialData.id}`, data); else await api.post(`/shifts`, data); onSuccess?.(); onClose(); };
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-xl rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b px-6 py-4"><h3 className="text-lg font-semibold">{initialData ? "Edit Shift" : "Add Shift"}</h3><button onClick={onClose} className="text-xl leading-none">×</button></div><form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2"><input className="rounded border p-3 md:col-span-2" placeholder="Shift Name" {...register("name", { required: true })} /><input type="time" className="rounded border p-3" {...register("startTime", { required: true })} /><input type="time" className="rounded border p-3" {...register("endTime", { required: true })} /><input type="number" className="rounded border p-3" placeholder="Late After Minutes" {...register("lateAfterMin", { valueAsNumber: true })} /><input type="number" className="rounded border p-3" placeholder="Early Out Minutes" {...register("earlyOutMin", { valueAsNumber: true })} /><div className="flex justify-end gap-3 pt-2 md:col-span-2"><button type="button" onClick={onClose} className="rounded border px-4 py-2">Cancel</button><button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Save</button></div></form></div></div>;
}
