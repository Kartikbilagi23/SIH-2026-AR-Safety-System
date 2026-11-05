import {
  Users,
  Zap,
  Award,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import type { DashboardStats } from "../../types/dashboard";
import SiteSafetyMap from "../../components/admin/SiteSafetyMap";

const AdminOverview = () => {
  const { t } = useLanguage();

  /*
   * Temporary values.
   * Replace with backend analytics when connected.
   */
  const stats: DashboardStats = {
    totalTrainees: 0,
    activeThisWeek: 0,
    certificatesIssued: 0,
    complianceRate: 0,
  };

  return (
    <section className="admin-overview">
      <div className="overview-header">
        <div>
          <h1>{t("overview")}</h1>

          <p>{t("overviewDescription")}</p>
        </div>

        <div className="realtime-status">
          <span className="status-dot" />
          {t("connectedRealtime")}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title={t("totalTrainees")}
          value={stats.totalTrainees.toLocaleString()}
          change="+14.2%"
          subtitle={t("vsLastMonth")}
          icon={<Users size={20} />}
        />

        <StatCard
          title={t("activeThisWeek")}
          value={stats.activeThisWeek.toLocaleString()}
          change="+28.4%"
          subtitle={t("vsLastMonth")}
          icon={<Zap size={20} />}
        />

        <StatCard
          title={t("certificatesIssued")}
          value={stats.certificatesIssued.toLocaleString()}
          change="+8.1%"
          subtitle={t("vsLastMonth")}
          icon={<Award size={20} />}
        />

        <StatCard
          title={t("complianceRate")}
          value={`${stats.complianceRate}%`}
          change="+4.7%"
          subtitle={t("vsLastMonth")}
          icon={<ShieldCheck size={20} />}
        />
      </div>
      <SiteSafetyMap/>
    </section>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  subtitle: string;
  icon: React.ReactNode;
}

const StatCard = ({
  title,
  value,
  change,
  subtitle,
  icon,
}: StatCardProps) => {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <div>
          <p className="stat-card-title">{title}</p>

          <h2 className="stat-card-value">{value}</h2>
        </div>

        <div className="stat-card-icon">{icon}</div>
      </div>

      <div className="stat-card-change">
        <ArrowUpRight size={14} />

        <span>{change}</span>

        <span className="stat-card-subtitle">
          {subtitle}
        </span>
      </div>
    </article>
  );
};

export default AdminOverview;
