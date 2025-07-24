import { useEffect, useState } from "react";
import {
  Typography,
  Tag,
  Spin,
  Row,
  Col,
  Card,
  Input,
  Button,
  message,
  Tooltip,
  Space,
  Alert,
  Divider,
  Empty,
} from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { fetchModelClassesSplit, updateModelClasses } from "../services/models";
import dayjs from "dayjs";
import { getUser } from "../utils/auth";

const { Title, Text } = Typography;

export default function ModelClassInfo({ model }) {
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [posClasses, setPosClasses] = useState([]);
  const [negClasses, setNegClasses] = useState([]);
  const [newPos, setNewPos] = useState("");
  const [newNeg, setNewNeg] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const user = getUser();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!model) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchModelClassesSplit(model);
        setClassInfo(data);
        setPosClasses(data.positive_classes || []);
        setNegClasses(data.negative_classes || []);
        setHasChanges(false);
      } catch (err) {
        message.error("Failed to load model classes");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [model]);

  useEffect(() => {
    // Check if current classes differ from original
    if (classInfo) {
      const posChanged =
        JSON.stringify(posClasses) !==
        JSON.stringify(classInfo.positive_classes || []);
      const negChanged =
        JSON.stringify(negClasses) !==
        JSON.stringify(classInfo.negative_classes || []);
      setHasChanges(posChanged || negChanged);
    }
  }, [posClasses, negClasses, classInfo]);

  const handleRemove = (type, value) => {
    if (type === "pos") {
      setPosClasses((prev) => prev.filter((item) => item !== value));
    } else {
      setNegClasses((prev) => prev.filter((item) => item !== value));
    }
  };

  const handleAdd = (type) => {
    const value = type === "pos" ? newPos.trim() : newNeg.trim();
    if (!value) return;

    const targetArray = type === "pos" ? posClasses : negClasses;
    if (targetArray.includes(value)) {
      message.warning(
        `"${value}" already exists in ${
          type === "pos" ? "positive" : "negative"
        } classes`
      );
      return;
    }

    if (type === "pos") {
      setPosClasses((prev) => [...prev, value]);
      setNewPos("");
    } else {
      setNegClasses((prev) => [...prev, value]);
      setNewNeg("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateModelClasses(model, posClasses, negClasses);
      setClassInfo((prev) => ({
        ...prev,
        positive_classes: [...posClasses],
        negative_classes: [...negClasses],
        updated_at: new Date().toISOString(),
      }));
      message.success("Model classes updated successfully");
      setHasChanges(false);
    } catch (err) {
      message.error("Failed to update model classes");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (classInfo) {
      setPosClasses([...(classInfo.positive_classes || [])]);
      setNegClasses([...(classInfo.negative_classes || [])]);
      setHasChanges(false);
    }
  };

  if (loading && !classInfo) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" tip="Loading model classes..." />
      </div>
    );
  }

  if (!classInfo) {
    return <Empty description="No model data available" />;
  }

  if (!classInfo.model_name) {
    return <Empty description="Model name not found" />;
  }

  return (
    <Card
      style={{
        backgroundColor: "#1a1a1a",
        color: "#fff",
        margin: "16px 0",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Title level={4} style={{ color: "#fff", marginBottom: 0 }}>
          {classInfo.model_name.toUpperCase()} Classes
        </Title>

        <Text
          type="secondary"
          style={{ display: "block", marginBottom: 16, color: "#ccc" }}
        >
          Last updated: {dayjs(classInfo.updated_at).format("YYYY-MM-DD HH:mm")}
        </Text>

        {hasChanges && isAdmin && (
          <Alert
            message="You have unsaved changes"
            type="warning"
            showIcon
            action={
              <Space>
                <Button size="small" type="text" onClick={handleReset}>
                  Reset
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={handleSave}
                  loading={saving}
                  icon={<SaveOutlined />}
                >
                  Save
                </Button>
              </Space>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        <Divider style={{ margin: "16px 0", borderColor: "#333" }} />

        <Row gutter={[24, 24]}>
          {/* Positive Classes */}
          <Col xs={24} md={12}>
            <Card
              size="small"
              title={
                <span style={{ color: "#faad14" }}>
                  Positive Classes <Tag color="orange">{posClasses.length}</Tag>
                </span>
              }
              style={{ backgroundColor: "#141414", borderColor: "#333" }}
              bodyStyle={{ padding: "12px" }}
            >
              <div
                style={{
                  minHeight: "120px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {posClasses.length > 0 ? (
                  posClasses.map((cls) => (
                    <Tag
                      color="red"
                      key={cls}
                      closable={isAdmin}
                      onClose={() => handleRemove("pos", cls)}
                      style={{
                        marginBottom: "8px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      {cls}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No positive classes defined</Text>
                )}
              </div>

              {isAdmin && (
                <div style={{ marginTop: 12 }}>
                  <Input
                    placeholder="Add positive class"
                    value={newPos}
                    onChange={(e) => setNewPos(e.target.value)}
                    onPressEnter={() => handleAdd("pos")}
                    allowClear
                    suffix={
                      <Tooltip title="Add">
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => handleAdd("pos")}
                          disabled={!newPos.trim()}
                          style={{ color: "#52c41a" }}
                        />
                      </Tooltip>
                    }
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* Negative Classes */}
          <Col xs={24} md={12}>
            <Card
              size="small"
              title={
                <span style={{ color: "#52c41a" }}>
                  Negative Classes <Tag color="green">{negClasses.length}</Tag>
                </span>
              }
              style={{ backgroundColor: "#141414", borderColor: "#333" }}
              bodyStyle={{ padding: "12px" }}
            >
              <div
                style={{
                  minHeight: "120px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {negClasses.length > 0 ? (
                  negClasses.map((cls) => (
                    <Tag
                      color="green"
                      key={cls}
                      closable={isAdmin}
                      onClose={() => handleRemove("neg", cls)}
                      style={{
                        marginBottom: "8px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      {cls}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No negative classes defined</Text>
                )}
              </div>

              {isAdmin && (
                <div style={{ marginTop: 12 }}>
                  <Input
                    placeholder="Add negative class"
                    value={newNeg}
                    onChange={(e) => setNewNeg(e.target.value)}
                    onPressEnter={() => handleAdd("neg")}
                    allowClear
                    suffix={
                      <Tooltip title="Add">
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => handleAdd("neg")}
                          disabled={!newNeg.trim()}
                          style={{ color: "#faad14" }}
                        />
                      </Tooltip>
                    }
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {isAdmin && hasChanges && (
          <div style={{ textAlign: "right", marginTop: "24px" }}>
            <Space>
              <Button onClick={handleReset}>Discard Changes</Button>
              <Button
                type="primary"
                loading={saving}
                onClick={handleSave}
                icon={<SaveOutlined />}
              >
                Save Changes
              </Button>
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
}
