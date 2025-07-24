import api from "./api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/team/login", { email, password });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Login failed. Please try again.");
  }
};

export const fetchTeamMembers = async () => {
  try {
    const response = await api.get("/team/all");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    throw error;
  }
};

export const createTeamMember = async (payload) => {
  try {
    const response = await api.post("/team/create", payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create team member:", error);
    throw error;
  }
};
