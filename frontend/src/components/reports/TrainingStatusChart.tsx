
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import { useLanguage } from "../../context/LanguageContext";

interface StatusItem {
  status: string;
  count: number;
}

interface TrainingStatusChartProps {
  data: StatusItem[];
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#059669",
  IN_PROGRESS: "#f59e0b",
  FAILED: "#dc2626",
};

const TrainingStatusChart = ({
  data,
}: TrainingStatusChartProps) => {
  const { t } = useLanguage();

  const total = data.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return t("chartCompleted");
      case "IN_PROGRESS":
        return t("chartInProgress");
      case "FAILED":
        return t("reportsFailed");
      default:
        return status;
    }
  };

  return (
    <div className="status-chart-container">
      <div className="status-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((item) => (
                <Cell
                  key={item.status}
                  fill={
                    STATUS_COLORS[item.status] ??
                    "#94a3b8"
                  }
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [
                value,
                getStatusLabel(String(name)),
              ]}
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="status-donut-center">
          <strong>{total}</strong>
          <span>{t("chartSessions")}</span>
        </div>
      </div>

      <div className="status-legend">
        {data.map((item) => (
          <div
            key={item.status}
            className="status-legend-item"
          >
            <div className="status-legend-left">
              <span
                className="status-legend-dot"
                style={{
                  background:
                    STATUS_COLORS[item.status] ??
                    "#94a3b8",
                }}
              />

              <span>{getStatusLabel(item.status)}</span>
            </div>

            <strong>{item.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingStatusChart;
