import {
  Bell,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const Navbar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const roleLabel =
    user?.role === "ADMIN"
      ? t("admin")
      : t("safetyOfficer");

  return (
    <header className="dashboard-navbar">
      <div className="navbar-left">
        <div>
          <p className="navbar-label">
            {t("safetyPlatform")}
          </p>

          <h2 className="navbar-title">
            {t("adminDashboard")}
          </h2>
        </div>
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="notification-button"
          aria-label={t("notifications")}
          title={t("notifications")}
        >
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="navbar-user">
          <div className="navbar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="navbar-user-info">
            <span className="navbar-user-name">
              {user?.name}
            </span>

            <span className="navbar-user-role">
              {roleLabel}
            </span>
          </div>

          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;