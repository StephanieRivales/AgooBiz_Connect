import api from "./api";

export const reportsApi = {
  getPublicSummary: async () => (await api.get("/reports/public-summary")).data,
  getWeeklyTrend: async () => (await api.get("/reports/weekly-trend")).data,
  getCategoryDemand: async () => (await api.get("/reports/category-demand")).data,
  getTopSellers: async () => (await api.get("/reports/top-sellers")).data,
  getBarangayDemand: async () => (await api.get("/reports/barangay-demand")).data,
};