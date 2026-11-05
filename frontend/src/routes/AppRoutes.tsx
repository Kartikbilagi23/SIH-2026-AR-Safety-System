import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Reports from "../pages/admin/Report";
import ProtectedRoute from "./ProtectedRoute";
import Trainees from "../pages/Trainee/Trainees";
import AdminOverview from "../pages/admin/AdminOverview";
import AdminModules from "../pages/admin/AdminModules";
import DashboardLayout from "../components/layout/DashboardLayout";
import AdminCertificates from "../pages/admin/AdminCertificate";
import AdminModuleDetails from "../pages/admin/AdminModuleDetails";
import AdminCertificateDetails from "../pages/admin/AdminCertificateDetails";
import Settings from "../pages/admin/Settings";


const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <div>
                            Dashboard coming next 🔥
                        </div>
                    }
                />
                <Route
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]} />
                    }
                >
                    <Route element={<DashboardLayout />}>
                        <Route
                            path="/admin/overview"
                            element={<AdminOverview />}
                        />
                        <Route
                            path="/admin/workers"
                            element={<Trainees />}
                        />
                        <Route
                            path="/admin/modules"
                            element={<AdminModules />}
                        />
                        <Route
                            path="/admin/certificates"
                            element={<AdminCertificates />}
                        />
                        <Route
                            path="/admin/certificates/:certificateNumber"
                            element={
                                <AdminCertificateDetails />
                            }
                        />
                        <Route
                            path="/admin/reports"
                            element={<Reports />}
                        />
                        <Route
                            path="/admin/settings"
                            element={<Settings />}
                        />
                        <Route
                            path="/admin/modules/:id"
                            element={<AdminModuleDetails />}
                        />
                    </Route>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={["WORKER"]} />}>
                    <Route
                        path="/worker/dashboard"
                        element={<div>Worker Dashboard 🔥</div>}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;