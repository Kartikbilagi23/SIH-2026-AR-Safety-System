import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    path: "/admin/overview",
    icon: LayoutDashboard,
  },
  {
    label: "Trainees",
    path: "/admin/workers",
    icon: Users,
  },
  {
    label: "Training Modules",
    path: "/admin/modules",
    icon: BookOpen,
  },
  {
    label: "Certificates",
    path: "/admin/certificates",
    icon: Award,
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };
  const labelKeys = {
  Overview: "overview",
  Trainees: "trainees",
  "Training Modules": "modules",
  Certificates: "certificates",
  Reports: "reports",
  Settings: "settings",
} as const;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>SurakshaSetu</h1>
        <span>Safety Training</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <Icon size={20} />
              <span>{t(labelKeys[item.label])}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut size={18} />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;