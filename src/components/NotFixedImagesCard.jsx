import { use, useEffect, useState } from "react";
import {
  Modal,
  Row,
  Col,
  Button,
  Tag,
  Space,
  Typography,
  Grid,
  Tooltip,
  Select,
  Spin,
} from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenExitOutlined,
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  notFixedImages,
  fetchImageDetails,
} from "../services/labellingService";
import { fetchModelVersions } from "../services/models";
import ImageCard from "./ImageCard"; // adjust path as necessary
import PredictionDetailsCard from "./PredictionDetailsCard";

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function NotFixedImagesCard({ model }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [selectedInputId, setSelectedInputId] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [expected_tags, setExpectedTags] = useState([]);
  const [evaluatedBy, setEvaluatedBy] = useState({});
  const [markedBy, setMarkedBy] = useState({});
  const screens = useBreakpoint();
  const pageSize = calculatePageSize(screens);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versions, setVersions] = useState([]);

  function calculatePageSize(screens) {
    if (screens.xxl) return 24;
    if (screens.xl) return 20;
    if (screens.lg) return 16;
    if (screens.md) return 12;
    if (screens.sm) return 8;
    return 4;
  }

  useEffect(() => {
    const loadVersions = async () => {
      setLoadingVersions(true);
      try {
        const data = await fetchModelVersions(model);
        const versionList = data.versions.map((v) => v.version);
        setVersions(versionList);
        if (versionList.length > 0) {
          setSelectedVersion(versionList[versionList.length - 1]); // latest
        }
      } catch (err) {
        console.error("Failed to fetch versions", err);
      } finally {
        setLoadingVersions(false);
      }
    };

    loadVersions();
  }, [model]);

  const fetchData = async () => {
    try {
      const data = await notFixedImages(model, selectedVersion, 10, 1);
      setImages(data.results || []);
    } catch (error) {
      console.error("Failed to fetch not fixed images:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [model, selectedVersion]);

  const handleVersionChange = (value) => {
    setSelectedVersion(value);
    fetchData();
    // You might want to fetch data here when version changes
  };

  const handleCardClick = async (
    inputId,
    imageUrl,
    expected_tags,
    evaluatedBy,
    markedBy
  ) => {
    try {
      const res = await fetchImageDetails(inputId);
      setPredictionData(res.predictions || []);
      setSelectedInputId(inputId);
      setSelectedImageUrl(imageUrl);
      setExpectedTags(expected_tags);
      setEvaluatedBy(evaluatedBy);
      setMarkedBy(markedBy);
      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching prediction details:", err);
    }
  };

  return (
    <div style={{ padding: "10px", color: "#ffffff" }}>
      <div
        style={{
          paddingLeft: "12px",
          display: "flex",
          gap: "2rem",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            color: "#fff",
            margin: 0,
            fontSize: "18px",
            fontWeight: 500,
          }}
        >
          Version
        </h2>

        {loadingVersions ? (
          <Spin />
        ) : (
          <Select
            value={selectedVersion}
            onChange={handleVersionChange}
            style={{ width: 200 }}
            placeholder="Select version"
          >
            {versions.map((v) => (
              <Select.Option key={v} value={v}>
                {v}
              </Select.Option>
            ))}
          </Select>
        )}
      </div>
      <h2>
        Not Fixed Images for {model} - Version {selectedVersion}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <Row gutter={[16, 16]}>
          {images.map((img) => (
            <Col key={img._id} xs={24} sm={12} md={8} lg={12} xl={12} xxl={12}>
              <ImageCard
                image={img}
                onCardClick={(inputId) =>
                  handleCardClick(
                    inputId,
                    img.input_value,
                    img.expected_tags,
                    img.evaluated_by,
                    img.marked_by
                  )
                }
              />
            </Col>
          ))}
        </Row>
      </div>
      <Modal
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Image Preview with Predictions</span>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              ID: {selectedInputId}
            </Tag>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={screens.xs ? "90%" : screens.lg ? "80%" : "70%"}
        style={{ top: 10 }}
        styles={{
          padding: "24px",
          maxHeight: "calc(100vh - 200px)",
          overflow: "hidden",
        }}
      >
        <Row gutter={[24, 24]} style={{ height: "100%", position: "relative" }}>
          {/* Image Column */}
          <Col xs={24} md={12} style={{ height: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                backgroundColor: "#f0f0f0",
                borderRadius: 8,
                padding: screens.xs ? "8px" : "16px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "75%",
                  backgroundColor: "#f0f0f0",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <img
                  alt="Preview"
                  src={selectedImageUrl}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />

                {/* Image Controls */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    display: "flex",
                    gap: 8,
                    zIndex: 1,
                  }}
                >
                  {/* <Tooltip title="Zoom In"> */}
                  {/* <Button */}
                  {/* icon={<ZoomInOutlined />} */}
                  {/* size="small" */}
                  {/* onClick={() => { */}
                  {/* /* Zoom logic */}
                  {/* }} */}
                  {/* /> */}
                  {/* </Tooltip> */}
                  {/* <Tooltip title="Zoom Out"> */}
                  {/* <Button */}
                  {/* icon={<ZoomOutOutlined />} */}
                  {/* size="small" */}
                  {/* onClick={() => { */}
                  {/* /* Zoom logic */}
                  {/* }} */}
                  {/* /> */}
                  {/* </Tooltip> */}
                  <Tooltip title="Reset Zoom">
                    <Button
                      icon={<FullscreenExitOutlined />}
                      size="small"
                      onClick={() => {
                        /* Reset zoom logic */
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Metadata at bottom of image */}
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#f9f9f9",
                borderRadius: 8,
                border: "1px solid #f0f0f0",
              }}
            >
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <div>
                  <Text strong>Expected Tags: </Text>
                  {expected_tags?.length > 0 ? (
                    <Space size={[4, 4]} wrap>
                      {expected_tags.map((tag) => (
                        <Tag key={tag} color="orange">
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">None</Text>
                  )}
                </div>

                <div>
                  <Text strong>Evaluated By: </Text>
                  <Text>
                    {evaluatedBy || <Text type="secondary">N/A</Text>}
                  </Text>
                </div>

                <div>
                  <Text strong>Marked By: </Text>
                  <Text>{markedBy || <Text type="secondary">N/A</Text>}</Text>
                </div>
              </Space>
            </div>
          </Col>

          {/* Prediction Details Column */}
          <Col xs={24} md={12} style={{ height: "100%" }}>
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: screens.xs ? "8px" : "0 8px",
                  borderLeft: screens.md ? "1px solid #f0f0f0" : "none",
                  paddingLeft: screens.md ? "24px" : "0",
                  marginBottom: 16,
                }}
              >
                <PredictionDetailsCard predictions={predictionData} />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <Button onClick={() => setModalOpen(false)}>Close</Button>
                <Button type="primary" icon={<DownloadOutlined />}>
                  Download Image
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}
