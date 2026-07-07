import api from "./api";

export const loanService = {
  createLoan: async (loanData) => {
    const response = await api.post("/loans/", loanData);
    return response.data;
  },
  getAllLoans: async () => {
    const response = await api.get("/loans/");
    return response.data;
  },

  getLoanById: async (loanId) => {
    const response = await api.get(`/loans/${loanId}`);
    return response.data;
  },

  updateLoan: async (loanId, updateData) => {
    const response = await api.put(`/loans/${loanId}`, updateData);
    return response.data;
  },

  deleteLoan: async (loanId) => {
    const response = await api.delete(`/loans/${loanId}`);
    return response.data;
  },
};
