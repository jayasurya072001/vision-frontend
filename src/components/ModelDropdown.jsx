import { Select } from "antd";
import { useEffect, useState } from "react";
import { fetchModelsWithVersions } from "../services/models";

const models = ["nudity", "violence", "scam"]; // Add more as needed

export default function ModelDropdown({ value, onChange }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      const result = await fetchModelsWithVersions();
      setModels(Object.keys(result));
      setLoading(false);
    };
    fetchModels();
  }, []);

  return (
    <Select
      value={value}
      onChange={onChange}
      style={{ width: 200 }}
      loading={loading}
      placeholder="Select Model"
    >
      {models.map((model) => (
        <Select.Option key={model} value={model}>
          {model}
        </Select.Option>
      ))}
    </Select>
  );
}
