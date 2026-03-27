import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../api/client";
import { Department, Employee, Shift } from "../../types";

type EmployeeFormValues = { employeeCode: string; firstName: string; lastName: string; gender?: string; phone?: string; email?: string; deviceUserId?: string; departmentId?: string; shiftId?: string; status?: string; photo?: FileList; };
type Props = { open: boolean; onClose: () => void; initialData?: Employee; departments?: Department[]; shifts?: Shift[]; onSuccess?: () => void; };
export default function EmployeeModal({ open, onClose, initialData, departments = [], shifts = [], onSuccess }: Props) {
  const { register, handleSubmit, reset } = useForm<EmployeeFormValues>();
  useEffect(() => {
    if (!open) return;
    if (initialData) reset({ employeeCode: initialData.employeeCode, firstName: initialData.firstName, lastName: initialData.lastName, gender: initialData.gender || "", phone: initialData.phone || "", email: initialData.email || "", deviceUserId: initialData.deviceUserId || "", departmentId: initialData.departmentId ? String(initialData.departmentId) : "", shiftId: initialData.shiftId ? String(initialData.shiftId) : "", status: initialData.status || "ACTIVE" });
    else reset({ employeeCode: "", firstName: "", lastName: "", gender: "", phone: "", email: "", deviceUserId: "", departmentId: "", shiftId: "", status: "ACTIVE" });
  }, [open, initialData, reset]);
  const onSubmit = async (data: EmployeeFormValues) => {
    const formData = new FormData();
    Object.entries({ ...data, photo: undefined }).forEach(([k,v]) => formData.append(k, (v as string) || ""));
    if (data.photo?.[0]) formData.append("photo", data.photo[0]);
    if (initialData?.id) await api.put(`/employees/${initialData.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    else await api.post("/employees", formData, { headers: { "Content-Type": "multipart/form-data" } });
    onSuccess?.(); onClose();
  };
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b px-6 py-4"><h3 className="text-lg font-semibold">{initialData ? "Edit Employee" : "Add Employee"}</h3><button onClick={onClose} className="text-xl leading-none">×</button></div><form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2"><input className="rounded border p-3" placeholder="Employee Code" {...register("employeeCode", { required: true })} /><input className="rounded border p-3" placeholder="Device User ID" {...register("deviceUserId")} /><input className="rounded border p-3" placeholder="First Name" {...register("firstName", { required: true })} /><input className="rounded border p-3" placeholder="Last Name" {...register("lastName", { required: true })} /><select className="rounded border p-3" {...register("gender")}><option value="">Gender</option><option value="Male">Male</option><option value="Female">Female</option></select><select className="rounded border p-3" {...register("status")}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><input className="rounded border p-3" placeholder="Phone" {...register("phone")} /><input className="rounded border p-3" placeholder="Email" {...register("email")} /><select className="rounded border p-3" {...register("departmentId")}><option value="">Department</option>{departments.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select><select className="rounded border p-3" {...register("shiftId")}><option value="">Shift</option>{shifts.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select><input type="file" className="rounded border p-3 md:col-span-2" {...register("photo")} /><div className="flex justify-end gap-3 pt-2 md:col-span-2"><button type="button" onClick={onClose} className="rounded border px-4 py-2">Cancel</button><button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Save</button></div></form></div></div>;
}
