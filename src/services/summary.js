import api from "./api";

export const fetchSummaryData = async (modelName) => {
  try {
    const response = await api.get(`/inputs/summary/${modelName}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch model versions"
    );
  }
};

export const fetchSummaryByEvaluated = async (modelName) => {
  try {
    const response = await api.get(`/inputs/summary/evaluated-by/${modelName}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch model versions"
    );
  }
};

export const fetchSummaryByMarked = async (modelName) => {
  try {
    const response = await api.get(`/inputs/summary/marked-by/${modelName}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch model versions"
    );
  }
};
