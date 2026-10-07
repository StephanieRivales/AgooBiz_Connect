import api from "./api";

export const reportsApi = {
  getPublicSummary: async () => (await api.get("/reports/public-summary")).data.data,
  getWeeklyTrend: async () => (await api.get("/reports/weekly-trend")).data.data,
  getCategoryDemand: async () => (await api.get("/reports/category-demand")).data.data,
  getTopSellers: async () => (await api.get("/reports/top-sellers")).data.data,
  getBarangayDemand: async () => (await api.get("/reports/barangay-demand")).data.data,
  getAdminSummary: async () => (await api.get("/reports/summary")).data.data,
  getSales: async () => (await api.get("/reports/sales")).data.data,
  getSellerSummary: async () => (await api.get("/reports/seller")).data.data,
  getUserReports: async () => (await api.get("/user-reports")).data.data,
  submitUserReport: async (report) => (await api.post("/user-reports", report)).data.data,
  updateUserReport: async (id, update) => (await api.put(`/user-reports/${id}`, update)).data.data,
};