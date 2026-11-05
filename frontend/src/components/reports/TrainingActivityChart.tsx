
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useLanguage } from "../../context/LanguageContext";

interface TrendItem {
  date: string;
  started: number;
  completed: number;
}

interface TrainingActivityChartProps {
  data: TrendItem[];
}

const TrainingActivityChart = ({
  data,
}: TrainingActivityChartProps) => {
  const { t, language } = useLanguage();

  const dateLocale = language === "hi" ? "hi-IN" : "en-IN";

  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString(dateLocale, {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          left: -20,
          bottom: 5,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />

        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 11,
            fill: "#64748b",
          }}
        />

        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 11,
            fill: "#64748b",
          }}
        />

        <Tooltip
          contentStyle={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow:
              "0 4px 12px rgba(15, 23, 42, 0.08)",
            fontSize: "12px",
          }}
        />

        <Line
          type="monotone"
          dataKey="started"
          name={t("chartStarted")}
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />

        <Line
          type="monotone"
          dataKey="completed"
          name={t("chartCompleted")}
          stroke="#059669"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrainingActivityChart;
