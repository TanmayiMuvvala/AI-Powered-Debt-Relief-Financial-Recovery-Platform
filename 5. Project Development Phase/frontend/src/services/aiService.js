import api from "./api";

export const aiService = {
  /**
   * Generate AI content for a loan.
   * @param {number} loanId
   * @param {string} contentType - settlement_letter | negotiation_email |
   *                               negotiation_strategy | settlement_advice
   * @param {string} additionalContext - Optional user context
   */
  generateContent: async (loanId, contentType, additionalContext = null) => {
    const response = await api.post(`/ai/${loanId}/generate`, {
      content_type: contentType,
      additional_context: additionalContext,
    });
    return response.data;
  },
  getHistoryByLoan: async (loanId) => {
    const response = await api.get(`/ai/${loanId}/history`);
    return response.data;
  },

  getAllHistory: async () => {
    const response = await api.get("/ai/history/all");
    return response.data;
  },

  getHistoryRecord: async (historyId) => {
    const response = await api.get(`/ai/history/${historyId}`);
    return response.data;
  },
};
