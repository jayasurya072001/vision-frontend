import api from "./api";

export const fetchModelsWithVersions = async () => {
  try {
    const response = await api.get("/models");
    const models = response.data.models || [];

    const grouped = models.reduce((acc, item) => {
      const { model_name, version } = item;
      if (!acc[model_name]) {
        acc[model_name] = [];
      }
      acc[model_name].push(version);
      return acc;
    }, {});

    // Sort versions descending (optional)
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort().reverse();
    });

    return grouped;
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return {};
  }
};

export const fetchModelClasses = async (model) => {
  try {
    const response = await api.get(`/model-classes/${model}`);
    const data = response.data || {};
    const positive = data.positive_classes || [];
    const negative = data.negative_classes || [];
    return [...positive, ...negative];
  } catch (error) {
    console.error(`Failed to fetch model classes for ${model}:`, error);
    return [];
  }
};

export const fetchModelVersions = async (modelName) => {
  try {
    const response = await api.get(`/models/${modelName}/versions`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch model versions"
    );
  }
};

export const fetchModelClassesSplit = async (model) => {
  try {
    const response = await api.get(`/model-classes/${model}`);
    const data = response.data || {};
    return data;
  } catch (error) {
    console.error(`Failed to fetch model classes for ${model}:`, error);
    return [];
  }
};

export const updateModelClasses = async (
  model,
  positiveClasses,
  negativeClasses
) => {
  try {
    const response = await api.post("/model-classes/save", {
      model_name: model,
      positive_classes: positiveClasses,
      negative_classes: negativeClasses,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to update model classes for ${model}:`, error);
    throw new Error(
      error.response?.data?.message || "Failed to update model classes"
    );
  }
};
