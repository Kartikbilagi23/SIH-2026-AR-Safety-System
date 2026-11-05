import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getReportOverview = async () => {
  const response = await axios.get(`${API_URL}/admin/reports/overview`);
  return response.data;
};

export const getTrainingStatusReport = async () => {
  const response = await axios.get(`${API_URL}/admin/reports/status`);
  return response.data;
};

export const getModulePerformanceReport = async () => {
  const response = await axios.get(`${API_URL}/admin/reports/modules`);
  return response.data;
};

export const getTrainingTrendReport = async () => {
  const response = await axios.get(`${API_URL}/admin/reports/trend`);
  return response.data;
};

export const getRecentTrainingActivity = async () => {
  const response = await axios.get(`${API_URL}/admin/reports/activity`);
  return response.data;
};

export const exportReport = async () => {
  const response = await axios.get(
    `${API_URL}/admin/reports/export`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};