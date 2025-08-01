import {
  Card,
  Tag,
  Tooltip,
  Space,
  Typography,
  Divider,
  Badge,
  message,
} from "antd";
import { EyeOutlined, CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
const { Text, Title } = Typography;

function ImageCard({ image, onPreview, onCardClick }) {
  const {
    _id,
    input_value,
    expected_tags,
    evaluated,
    marked_at,
    model_name,
    predicted_versions,
    fix_status,
    regression_status,
  } = image;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input_value);
      message.success("Image URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const latestVersion =
    predicted_versions?.[predicted_versions.length - 1] || null;
  const isFixed = fix_status?.[latestVersion] === "fixed";
  const isRegressed = regression_status?.[latestVersion] === "regressed";

  return (
    <Card
      hoverable
      style={{
        maxWidth: 400,
        height: 440,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={() => onCardClick(image._id)}
      styles={{
        padding: 12,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
      cover={
        <div style={{ position: "relative", height: 250 }}>
          <img
            src={input_value}
            alt="Input"
            style={{
              height: "100%",
              width: "100%",
              objectFit: "cover",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(0,0,0,0.5)",
              borderRadius: 20,
              padding: "5px 10px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <Tooltip title="Preview Image">
              <EyeOutlined
                onClick={() => onPreview(input_value)}
                style={{ fontSize: 14, color: "#fff", cursor: "pointer" }}
              />
            </Tooltip>
            <Tooltip title="Copy URL">
              <CopyOutlined
                onClick={handleCopy}
                style={{ fontSize: 14, color: "#fff", cursor: "pointer" }}
              />
            </Tooltip>
          </div>
        </div>
      }
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8, // Consistent gap between all elements
        }}
      >
        {/* Compact header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title level={5} ellipsis style={{ margin: 0, lineHeight: 1.3 }}>
              {model_name || "Untitled Model"}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Evaluated {dayjs(marked_at).fromNow()}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12, alignSelf: "center" }}>
            ID: {_id}
          </Text>
        </div>

        {/* Tags section with constrained height */}
        {expected_tags?.length > 0 && (
          <div
            style={{
              marginBottom: 4,
              maxHeight: 60,
              overflow: "hidden",
            }}
          >
            <Text strong style={{ fontSize: 12, display: "block" }}>
              Tags:
            </Text>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginTop: 2,
                alignItems: "flex-start",
                lineHeight: 1.2,
              }}
            >
              {/* Show only the first tag */}
              <Tag
                key={expected_tags[0]}
                color="blue"
                style={{
                  fontSize: 11,
                  padding: "1px 4px",
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                {expected_tags[0]}
              </Tag>

              {/* Show ellipsis if there are more tags */}
              {expected_tags.length > 1 && (
                <Tag
                  color="default"
                  style={{
                    fontSize: 11,
                    padding: "1px 4px",
                    margin: 0,
                    flexShrink: 0,
                  }}
                >
                  ...
                </Tag>
              )}
            </div>
          </div>
        )}

        {/* Status badges in compact row */}
        {latestVersion && (
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: "auto",
              paddingTop: 4,
            }}
          >
            <Badge
              status={isFixed ? "success" : "error"}
              text={
                <Text style={{ fontSize: 12, lineHeight: 1 }}>
                  {latestVersion}: {fix_status?.[latestVersion] || "unknown"}
                </Text>
              }
            />
            {regression_status?.[latestVersion] && (
              <Badge
                status={isRegressed ? "error" : "success"}
                text={
                  <Text style={{ fontSize: 12, lineHeight: 1 }}>
                    Regression: {regression_status[latestVersion]}
                  </Text>
                }
              />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default ImageCard;
