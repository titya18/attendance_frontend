import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { toArray } from "../utils/api";
export default function DailyAttendancePage() {
  const today = new Date().toISOString().slice(0, 10); const [date, setDate] = useState(today);
  const query = useQuery({
    queryKey: ["daily-attendance"],
    queryFn: async () => {
      const res = await api.get(`/attendance/daily?date=${date}`);
      return toArray(res.data);
    },
  });
  const processAttendance = async () => { const res = await api.post("/attendance/process", { date }); alert(res.data.message || "Attendance processed successfully"); await query.refetch(); };
  return <div><div className="mb-4 flex items-center gap-3"><h2 className="text-2xl font-bold">Daily Attendance</h2><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border p-2" /><button onClick={processAttendance} className="rounded bg-green-600 px-4 py-2 text-white">Process</button></div><div className="overflow-auto rounded-xl bg-white shadow"><table className="w-full"><thead><tr className="bg-slate-100"><th className="p-3 text-left">Employee</th><th className="p-3 text-left">Check In</th><th className="p-3 text-left">Check Out</th><th className="p-3 text-left">Late</th><th className="p-3 text-left">Worked</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{(query.data || []).map((item: any) => <tr key={item.id} className="border-t"><td className="p-3">{item.employee.firstName} {item.employee.lastName}</td><td className="p-3">{item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : "-"}</td><td className="p-3">{item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : "-"}</td><td className="p-3">{item.lateMinutes} min</td><td className="p-3">{item.workedMinutes} min</td><td className="p-3">{item.status}</td></tr>)}</tbody></table></div></div>;
}
