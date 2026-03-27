import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../api/client";
import { Department } from "../../types";

type FormValues = { name: string; description?: string; };
type Props = { open: boolean; onClose: () => void; initialData?: Department; onSuccess?: () => void; };
export default function DepartmentModal({ open, onClose, initialData, onSuccess }: Props) {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  useEffect(() => { if (!open) return; if (initialData) reset({ name: initialData.name, description: initialData.description || "" }); else reset({ name: "", description: "" }); }, [open, initialData, reset]);
  const onSubmit = async (data: FormValues) => { if (initialData?.id) await api.put(`/departments/${initialData.id}`, data); else await api.post(`/departments`, data); onSuccess?.(); onClose(); };
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-xl rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b px-6 py-4"><h3 className="text-lg font-semibold">{initialData ? "Edit Department" : "Add Department"}</h3><button onClick={onClose} className="text-xl leading-none">×</button></div><form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6"><input className="w-full rounded border p-3" placeholder="Department Name" {...register("name", { required: true })} /><textarea className="w-full rounded border p-3" placeholder="Description" rows={4} {...register("description")} /><div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded border px-4 py-2">Cancel</button><button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Save</button></div></form></div></div>;
}
