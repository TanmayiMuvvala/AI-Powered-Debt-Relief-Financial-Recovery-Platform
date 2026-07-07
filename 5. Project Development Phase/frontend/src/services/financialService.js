import api from "./api";

export const financialService = {
  /** Get financial health analysis for a specific loan */
  getHealthByLoan: async (loanId) => {
    const response = await api.get(`/financial-health/${loanId}`);
    return response.data;
  },

  /** Get financial health for all loans */
  getAllHealth: async () => {
    const response = await api.get("/financial-health/all");
    return response.data;
  },

  /** Run settlement engine for a loan */
  computeSettlement: async (loanId) => {
    const response = await api.post(`/settlements/${loanId}/compute`);
    return response.data;
  },

  /** Get existing settlement recommendation */
  getSettlement: async (loanId) => {
    const response = await api.get(`/settlements/${loanId}`);
    return response.data;
  },

  /** Get all settlements for user */
  getAllSettlements: async () => {
    const response = await api.get("/settlements/all");
    return response.data;
  },
};
