import React from "react";
import { BrowserRouter, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import ShiftsPage from "./pages/ShiftsPage";
import DevicesPage from "./pages/DevicesPage";
import AttendanceLogsPage from "./pages/AttendanceLogsPage";
import DailyAttendancePage from "./pages/DailyAttendancePage";
import FaceAttendancePage from "./pages/FaceAttendancePage";
import FaceEnrollPage from "./pages/FaceEnrollPage";
import ReportsPage from "./pages/ReportsPage";
import RolesPage from "./pages/RolesPage";

const App: React.FC = () => {
    return (
        // <Router>
        <BrowserRouter basename="/attendance">
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="shifts" element={<ShiftsPage />} />
              <Route path="devices" element={<DevicesPage />} />
              <Route path="attendance-logs" element={<AttendanceLogsPage />} />
              <Route path="daily-attendance" element={<DailyAttendancePage />} />
              <Route path="face-attendance" element={<FaceAttendancePage />} />
              <Route path="face-enroll" element={<FaceEnrollPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="roles" element={<RolesPage />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        // </Router>
    );
};

export default App;
