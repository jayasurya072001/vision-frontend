import api from "./api";
import { getUser } from "../utils/auth";

export const fetchUnlabelledInputs = async (model, page, size = 20) => {
  const response = await api.get(
    `/inputs/unverified/${model}?page=${page}&size=${size}`
  );
  return response.data;
};

export const updateBulkTags = async (updates) => {
  const user = getUser().email;
  const response = await api.put("/inputs/update/bulk", {
    user,
    updates,
  });
  return response.data;
};

export const fetchItemsOfTags = async (
  model,
  page = 1,
  size = 10,
  expectedTag
) => {
  const response = await api.post(
    `/inputs/query/${model}?page=${page}&size=${size}`,
    {
      expectedTags: expectedTag,
    }
  );
  return response.data;
};

export const fetchImageDetails = async (id) => {
  const res = await api.get(`/predictions/details?input_id=${id}`);
  return res.data;
};

export const fetchRegressionInputs = async (
  model,
  version,
  limit = 10,
  skip = 0
) => {
  try {
    const response = await api.get(
      `/inputs/regression/${model}?version=${version}&limit=${limit}&skip=${skip}`
    );
    return response.data;
  } catch (err) {
    console.error("Failed to fetch regression inputs:", err);
    throw err;
  }
};

export const fetchFixedStatus = async (
  model,
  version,
  limit = 10,
  skip = 0
) => {
  try {
    const response = await api.get(
      `/inputs/fixed/${model}?version=${version}&limit=${limit}&skip=${skip}`
    );
    return response.data;
  } catch (err) {
    console.error("Failed to fetch regression inputs:", err);
    throw err;
  }
};

export const fetchNotFixedStatus = async (
  model,
  version,
  limit = 10,
  skip = 0
) => {
  try {
    const response = await api.get(
      `/inputs/not_fixed/${model}?version=${version}&limit=${limit}&skip=${skip}`
    );
    return response.data;
  } catch (err) {
    console.error("Failed to fetch regression inputs:", err);
    throw err;
  }
};

export const assignTask = async (inputId, assignedTo) => {
  try {
    const response = await api.post("/inputs/task/assignedTo", {
      input_id: inputId,
      assigned_to: assignedTo,
    });
    return response.data;
  } catch (err) {
    console.error("Failed to assign task:", err);
    throw new Error(err.response?.data?.message || "Failed to assign task");
  }
};

export const notFixedImages = async (model, version, limit = 10, skip = 0) => {
  try {
    const response = await api.post(
      `/inputs/query/${model}?&size=${limit}&page=${skip}`,
      {
        version: version,
        fixedStatus: "not_fixed",
        assignedTo: getUser().email,
      }
    );
    return response.data;
  } catch (err) {
    console.error("Failed to fetch not fixed images:", err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch not fixed images"
    );
  }
};
// export async function updateBulkTags(updates) {

//   const user = getUser().email
//   const response =

//   return fetch("/vision/inputs/update/bulk", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       user,
//       updates,
//     }),
//   });
// }
