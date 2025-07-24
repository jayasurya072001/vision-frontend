import { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Spin,
  Typography,
  Space,
  Button,
  Grid,
  Input,
  Avatar,
  Empty,
} from "antd";
import {
  RocketOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  CodeOutlined,
  CheckOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { fetchModelVersions } from "../services/models";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export default function VersionTab({ model }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const screens = useBreakpoint();

  useEffect(() => {
    const loadVersions = async () => {
      try {
        setLoading(true);
        const data = await fetchModelVersions(model);
        const sortedVersions = data.versions.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setVersions(sortedVersions);
        setError(null);
      } catch (err) {
        setError("Failed to load model versions");
        console.error("Error fetching versions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVersions();
  }, [model]);

  const filteredVersions = versions.filter(
    (version) =>
      version.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <Spin
          indicator={
            <RocketOutlined style={{ fontSize: 40, color: "#1890ff" }} spin />
          }
        />
        <Text style={{ color: "#ffffff", display: "block", marginTop: 16 }}>
          Loading model versions...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Text type="danger" style={{ fontSize: 16 }}>
          {error}
        </Text>
        <Button
          type="primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: 16 }}
          icon={<RocketOutlined />}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: screens.xs ? "16px 8px" : "16px 24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <Title level={3} style={{ color: "#ffffff", margin: 0 }}>
            <CodeOutlined style={{ marginRight: 12, color: "#1890ff" }} />
            {model} Versions
          </Title>

          <Input
            placeholder="Search versions..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: screens.xs ? "100%" : 300,
              backgroundColor: "#2a2a2a",
              borderColor: "#444",
              color: "#ffffff",
            }}
            allowClear
          />
        </div>

        {filteredVersions.length === 0 ? (
          <Empty
            description={
              <Text style={{ color: "#ffffff" }}>
                No versions found {searchTerm ? `for "${searchTerm}"` : ""}
              </Text>
            }
            style={{ marginTop: 40 }}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: screens.lg
                ? "repeat(3, 1fr)"
                : screens.md
                ? "repeat(2, 1fr)"
                : "1fr",
              gap: 16,
            }}
          >
            {filteredVersions.map((version) => (
              <Card
                key={version._id}
                hoverable
                style={{
                  backgroundColor: "#2a2a2a",
                  borderColor: "#444",
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "transform 0.2s",
                }}
                styles={{ padding: "20px" }}
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Tag
                      color="blue"
                      icon={<CheckOutlined />}
                      style={{
                        fontSize: 14,
                        padding: "4px 12px",
                        borderRadius: 20,
                        marginRight: 0,
                      }}
                    >
                      {version.version}
                    </Tag>
                    <Button
                      type="text"
                      shape="circle"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(version._id)}
                      style={{ color: "#aaaaaa" }}
                    />
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Avatar
                      size="small"
                      style={{ backgroundColor: "#1890ff" }}
                      icon={<ClockCircleOutlined />}
                    />
                    <Text type="secondary" style={{ color: "#aaaaaa" }}>
                      {dayjs(version.created_at).format("MMM D, YYYY")}
                    </Text>
                    <Text type="secondary" style={{ color: "#666666" }}>
                      •
                    </Text>
                    <Text type="secondary" style={{ color: "#aaaaaa" }}>
                      {dayjs(version.created_at).fromNow()}
                    </Text>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderRadius: 8,
                      padding: "12px",
                      marginTop: 8,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Text code style={{ color: "#ffffff", fontSize: 12 }}>
                      {version._id}
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    block
                    style={{ marginTop: 16 }}
                    onClick={() => console.log("View details", version._id)}
                  >
                    View Details
                  </Button>
                </Space>
              </Card>
            ))}
          </div>
        )}
      </Space>
    </div>
  );
}
