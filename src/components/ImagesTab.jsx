import {
  Card,
  Col,
  Modal,
  Row,
  Tooltip,
  Typography,
  message,
  Spin,
  Empty,
  Pagination,
  Grid,
  Tag,
  Button,
  Space,
} from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenExitOutlined,
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import {
  fetchItemsOfTags,
  fetchImageDetails,
} from "../services/labellingService";

import PredictionDetailsCard from "./PredictionDetailsCard";
import ImageCard from "./ImageCard";

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function ImagesTab({ model, filterTag = [] }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [imageDetails, setImageDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedInputId, setSelectedInputId] = useState(null);
  const [predictionData, setPredictionData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [expected_tags, setExpectedTags] = useState([]);
  const [evaluatedBy, setEvaluatedBy] = useState({});
  const [markedBy, setMarkedBy] = useState({});

  const screens = useBreakpoint();
  const pageSize = calculatePageSize(screens);

  function calculatePageSize(screens) {
    return 8;
  }

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

  const fetchImages = useCallback(async () => {
    if (!model) return;

    try {
      setLoading(true);
      const data = await fetchItemsOfTags(
        model,
        currentPage,
        pageSize,
        filterTag
      );

      setImages(data.results || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      message.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  }, [model, currentPage, filterTag, pageSize]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [model, filterTag]);

  const handleShowDetails = async (imageId) => {
    try {
      const details = await fetchImageDetails(imageId);
      setImageDetails(details);
      setDetailsVisible(true);
    } catch {
      message.error("Failed to fetch details");
    }
  };

  const getColSpan = () => {
    if (screens.xxl) return 6;
    if (screens.xl) return 6;
    if (screens.lg) return 8;
    if (screens.md) return 12;
    return 24;
  };

  return (
    <div
      style={{
        minHeight: "75vh",
        paddingBottom: "32px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {loading && images.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : images.length === 0 ? (
        <Empty
          description={
            <Text style={{ color: "#999" }}>
              {filterTag.length > 0
                ? "No images found with selected tags"
                : "No images found"}
            </Text>
          }
        />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {images.map((img) => (
              <Col key={img._id} xs={24} sm={12} md={8} lg={6} xl={6} xxl={6}>
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

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalCount}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              responsive
              showLessItems={screens.xs}
            />
          </div>
        </>
      )}
      <Modal
        title="Image Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={screens.xs ? "90%" : 700}
        styles={{
          backgroundColor: "#1e1e1e",
          color: "#fff",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        {imageDetails ? (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              color: "#eee",
              margin: 0,
            }}
          >
            {JSON.stringify(imageDetails, null, 2)}
          </pre>
        ) : (
          <div style={{ textAlign: "center" }}>
            <Spin />
            <Text style={{ color: "#ccc", display: "block", marginTop: "8px" }}>
              Loading details...
            </Text>
          </div>
        )}
      </Modal>
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
      {/* {/* <Button */}
      {/* type="primary" */}
      {/* icon={<EditOutlined />} */}
      {/* onClick={() => { */}
      {/*  Edit logic  */}
      {/* //   }} */}
      {/* // > */}
      {/* //   Edit Tags */}
      {/* // </Button> */} */
    </div>
  );
}
