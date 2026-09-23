import api from "./api";

export const reportsApi = {
  getPublicSummary: async () => (await api.get("/reports/public-summary")).data.data,
  getWeeklyTrend: async () => (await api.get("/reports/weekly-trend")).data.data,
  getCategoryDemand: async () => (await api.get("/reports/category-demand")).data.data,
  getTopSellers: async () => (await api.get("/reports/top-sellers")).data.data,
  getBarangayDemand: async () => (await api.get("/reports/barangay-demand")).data.data,
};