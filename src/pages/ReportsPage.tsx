import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../api/client";
import { toArray } from "../utils/api";

export default function ReportsPage() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const currentDay = today.toISOString().slice(0, 10);
  const [from, setFrom] = useState(firstDay); 
  const [to, setTo] = useState(currentDay); 
  const [employeeId, setEmployeeId] = useState("");
  const employeesQuery = useQuery({ queryKey: ["report-employees"], 
    queryFn: async () => {
      const res = await api.get("/employees");
      return toArray(res.data);
    } });
  const reportQuery = useQuery({
    queryKey: ["attendance-report", from, to, employeeId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("from", from);
      params.set("to", to);
      if (employeeId) params.set("employeeId", employeeId);

      const res = await api.get(`/reports/attendance?${params.toString()}`);
      return res.data; // ✅ DO NOT use toArray here
    }
  });
  const rows = reportQuery.data?.rows || []; 
  const summary = reportQuery.data?.summary || { totalRecords: 0, totalPresent: 0, totalLate: 0, totalAbsent: 0 };
  const tableData = useMemo(() => rows.map((item: any) => ({ 
    Date: item.date, 
    Code: item.employeeCode, 
    Employee: item.employeeName, 
    Department: item.department, 
    Shift: item.shift, 
    CheckIn: item.checkIn, 
    CheckOut: item.checkOut,
     Late: item.lateMinutes, 
     Worked: item.workedMinutes, 
     Status: item.status 
  })), [rows]);
  const exportFrontendExcel = () => { 
    const worksheet = XLSX.utils.json_to_sheet(tableData); 
    const workbook = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report"); 
    XLSX.writeFile(workbook, `attendance-report-${Date.now()}.xlsx`); 
  };
  const exportFrontendPdf = () => { 
    const doc = new jsPDF(); 
    doc.text("Attendance Report", 14, 15); 
    autoTable(doc, { 
      startY: 22, head: [["Date", "Code", "Employee", "Department", "Shift", "Check In", "Check Out", "Late", "Worked", "Status"]], 
      body: rows.map((item: any) => [
        item.date, 
        item.employeeCode, 
        item.employeeName, 
        item.department, 
        item.shift, 
        item.checkIn, 
        item.checkOut, 
        item.lateMinutes, 
        item.workedMinutes, 
        item.status]), 
      styles: { fontSize: 8 } }); doc.save(`attendance-report-${Date.now()}.pdf`); 
    };
  const exportBackendExcel = () => { 
    const params = new URLSearchParams(); 
    params.set("from", from); 
    params.set("to", to); 
    if (employeeId) params.set("employeeId", employeeId); 
    window.open(`${import.meta.env.VITE_API_URL}/api/reports/attendance/excel?${params.toString()}`, "_blank"); 
  };
  const exportBackendPdf = () => { 
    const params = new URLSearchParams(); 
    params.set("from", from); 
    params.set("to", to); 
    if (employeeId) params.set("employeeId", employeeId); 
    window.open(`${import.meta.env.VITE_API_URL}/api/reports/attendance/pdf?${params.toString()}`, "_blank"); 
  };
  return <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Reports</h2>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl bg-white p-4 shadow md:grid-cols-4">
            <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="rounded border p-3" />
            <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="rounded border p-3" />
            <select value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)} className="rounded border p-3">
              <option value="">All Employees</option>
              {(employeesQuery.data || []).map((item: any) => 
                <option key={item.id} value={item.id}>{item.employeeCode} - {item.firstName} {item.lastName}</option>)
              }
            </select>
            <button onClick={() => reportQuery.refetch()} className="rounded bg-blue-600 px-4 py-2 text-white">Refresh</button>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-white p-4 shadow">
              <div className="text-sm text-gray-500">Total Records</div>
              <div className="mt-2 text-2xl font-bold">{summary.totalRecords}</div>
              </div>
            <div className="rounded-xl bg-white p-4 shadow">
              <div className="text-sm text-gray-500">Present</div>
              <div className="mt-2 text-2xl font-bold">{summary.totalPresent}</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow">
              <div className="text-sm text-gray-500">Late</div>
              <div className="mt-2 text-2xl font-bold">{summary.totalLate}</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow">
              <div className="text-sm text-gray-500">Absent</div>
              <div className="mt-2 text-2xl font-bold">{summary.totalAbsent}</div>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={exportFrontendExcel} className="rounded bg-green-600 px-4 py-2 text-white">Export Frontend Excel</button>
            <button onClick={exportFrontendPdf} className="rounded bg-red-600 px-4 py-2 text-white">Export Frontend PDF</button>
            <button onClick={exportBackendExcel} className="rounded bg-emerald-700 px-4 py-2 text-white">Export Backend Excel</button>
            <button onClick={exportBackendPdf} className="rounded bg-rose-700 px-4 py-2 text-white">Export Backend PDF</button>
          </div><div className="overflow-auto rounded-xl bg-white shadow">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Shift</th>
                  <th className="p-3 text-left">Check In</th>
                  <th className="p-3 text-left">Check Out</th>
                  <th className="p-3 text-left">Late</th>
                  <th className="p-3 text-left">Worked</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
                </thead>
                <tbody>
                  {rows.map((item: any) => 
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.date}</td>
                      <td className="p-3">{item.employeeCode}</td>
                      <td className="p-3">{item.employeeName}</td>
                      <td className="p-3">{item.department}</td>
                      <td className="p-3">{item.shift}</td>
                      <td className="p-3">{item.checkIn}</td>
                      <td className="p-3">{item.checkOut}</td>
                      <td className="p-3">{item.lateMinutes}</td>
                      <td className="p-3">{item.workedMinutes}</td>
                      <td className="p-3">{item.status}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>;
}
