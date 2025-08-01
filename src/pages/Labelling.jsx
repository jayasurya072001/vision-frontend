import { useEffect, useState, useRef, useCallback } from "react";
import {
  Spin,
  Row,
  Col,
  Card,
  message,
  Modal,
  Button,
  Tag,
  Divider,
  Input,
  Space,
  Tooltip,
  Checkbox,
} from "antd";
import {
  CopyOutlined,
  ZoomInOutlined,
  TagOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import ModelDropdown from "../components/ModelDropdown";
import {
  fetchUnlabelledInputs,
  updateBulkTags,
} from "../services/labellingService";
import { fetchModelClasses } from "../services/models";
import LayoutWrapper from "../components/LayoutWrapper";

export default function Labelling() {
  const [model, setModel] = useState("nudity");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [modelClasses, setModelClasses] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const [previewImage, setPreviewImage] = useState({
    visible: false,
    url: "",
  });
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAllTags, setSelectAllTags] = useState(false);

  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const pageSize = 8;

  // Fetch model classes when model changes
  useEffect(() => {
    const loadModelClasses = async () => {
      try {
        const classes = await fetchModelClasses(model);
        setModelClasses(classes);
      } catch (error) {
        message.error("Failed to load model classes");
      }
    };
    loadModelClasses();
  }, [model]);

  // Filter model classes based on search term
  const filteredClasses = modelClasses.filter((cls) =>
    cls.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadData = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    loadingRef.current = true;
    setLoading(true);

    try {
      const response = await fetchUnlabelledInputs(
        model,
        pageRef.current,
        pageSize,
        { signal: abortController.signal }
      );
      const newItems = response.results || [];

      setData((prev) => {
        const existingIds = new Set(prev.map((item) => item._id));
        const uniqueNewItems = newItems.filter(
          (item) => !existingIds.has(item._id)
        );
        return [...prev, ...uniqueNewItems];
      });

      setTotal(response.total || 0);
      setHasMore(newItems.length === pageSize);
    } catch (error) {
      if (error.name !== "AbortError") {
        message.error("Failed to load inputs");
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [model, hasMore]);

  // Reset when model changes
  useEffect(() => {
    const fetchData = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setData([]);
      pageRef.current = 1;
      setTotal(0);
      setHasMore(true);
      setSelectedTags({});
      setSelectedImages(new Set());

      await loadData();
    };

    fetchData();
  }, [model]);

  const handleModelChange = (value) => {
    setModel(value);
    // You might want to fetch data here when model changes
  };

  const handleScroll = useCallback(() => {
    if (loadingRef.current || !hasMore) return;

    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollThreshold = 100;

    if (scrollHeight - (scrollTop + clientHeight) < scrollThreshold) {
      pageRef.current += 1;
      loadData();
    }
  }, [hasMore, loadData]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handlePreview = (url) => {
    setPreviewImage({
      visible: true,
      url,
    });
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    message.success("URL copied to clipboard!");
  };

  const handleSubmitTags = async () => {
    const updates = Object.entries(selectedTags)
      .filter(([_, tags]) => tags && tags.length > 0)
      .map(([input_id, expected_tags]) => ({
        input_id,
        expected_tags,
      }));

    if (updates.length === 0) {
      message.warning("No images have any tags assigned.");
      return;
    }

    try {
      const result = await updateBulkTags(updates);
      message.success(`${result.modified_count} inputs updated successfully`);
      window.location.reload();
    } catch (error) {
      console.error(error);
      message.error("Failed to submit tags.");
    }
  };

  const handleTagSelection = (className) => {
    if (selectedImages.size === 0) {
      message.warning("Please select at least one image first");
      return;
    }

    const newSelectedTags = { ...selectedTags };
    selectedImages.forEach((id) => {
      newSelectedTags[id] = newSelectedTags[id]
        ? [...new Set([...newSelectedTags[id], className])]
        : [className];
    });
    setSelectedTags(newSelectedTags);
    message.success(`Added "${className}" to ${selectedImages.size} image(s)`);
  };

  const handleTagRemove = (itemId, tagToRemove) => {
    setSelectedTags((prev) => ({
      ...prev,
      [itemId]: prev[itemId].filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageSelect = (itemId, e) => {
    e.stopPropagation();
    const newSelection = new Set(selectedImages);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedImages(newSelection);
  };

  const handleSelectAllTags = () => {
    setSelectAllTags(!selectAllTags);
  };

  const handleAssignToAll = (className) => {
    const newSelectedTags = { ...selectedTags };
    data.forEach((item) => {
      newSelectedTags[item._id] = newSelectedTags[item._id]
        ? [...new Set([...newSelectedTags[item._id], className])]
        : [className];
    });
    setSelectedTags(newSelectedTags);
    message.success(`Added "${className}" to all images`);
  };

  return (
    <LayoutWrapper>
      <div
        style={{
          display: "flex",
          height: "90vh",
          width: "92vw", // Changed to vw
          overflow: "hidden", // Prevent double scrollbars
          gap: "2rem",
        }}
      >
        {/* Main content area (left) - 75% width */}
        <div
          ref={containerRef}
          style={{
            width: "75vw", // Using vw units
            height: "100%",
            overflow: "auto",
            padding: 16,
          }}
        >
          {/* <ModelDropdown value={model} onChange={setModel} /> */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <ModelDropdown value={model} onChange={handleModelChange} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                onClick={() => {
                  // Select all images
                  const allIds = data.map((item) => item._id);
                  setSelectedImages(new Set(allIds));
                  message.success(`Selected all ${allIds.length} images`);
                }}
              >
                Select All Images
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                onClick={() => {
                  // Unselect all images
                  setSelectedImages(new Set());
                  message.success("Unselected all images");
                }}
              >
                Unselect All Images
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                onClick={() => {
                  // Clear all selected tags
                  const clearedTags = {};
                  data.forEach((item) => {
                    clearedTags[item._id] = [];
                  });
                  setSelectedTags(clearedTags);
                  message.success("Cleared tags for all images");
                }}
                danger
              >
                Clear All Tags
              </Button>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {data.map((item) => (
              <Col key={item._id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  style={{
                    transition: "border 0.1s",
                    position: "relative",
                    border: selectedImages.has(item._id)
                      ? "4px solid #1890ff"
                      : "1px solid #f0f0f0",
                  }}
                  onClick={(e) => {
                    // Only select if not clicking on buttons
                    if (
                      e.target.tagName !== "BUTTON" &&
                      !e.target.closest("button")
                    ) {
                      const newSelection = new Set(selectedImages);
                      if (newSelection.has(item._id)) {
                        newSelection.delete(item._id);
                      } else {
                        newSelection.add(item._id);
                      }
                      setSelectedImages(newSelection);
                    }
                  }}
                  cover={
                    <div style={{ position: "relative" }}>
                      <img
                        alt="input"
                        src={item.input_value}
                        style={{
                          height: "30vh",
                          minHeight: 300,
                          maxHeight: 400,
                          objectFit: "cover",
                          width: "100%",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <Button
                          icon={<ZoomInOutlined />}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(item.input_value);
                          }}
                        />
                        <Button
                          icon={<CopyOutlined />}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(item.input_value);
                          }}
                        />
                      </div>
                    </div>
                  }
                >
                  <Checkbox
                    checked={selectedImages.has(item._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newSelection = new Set(selectedImages);
                      if (newSelection.has(item._id)) {
                        newSelection.delete(item._id);
                      } else {
                        newSelection.add(item._id);
                      }
                      setSelectedImages(newSelection);
                    }}
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      zIndex: 1,
                    }}
                  />
                  <Card.Meta
                    description={
                      <div style={{ minHeight: 80 }}>
                        <Space size={[0, 8]} wrap>
                          {selectedTags[item._id]?.map((tag) => (
                            <Tag
                              key={tag}
                              closable
                              onClose={(e) => {
                                e.stopPropagation();
                                handleTagRemove(item._id, tag);
                              }}
                              style={{
                                marginBottom: 4,
                                borderRadius: 4,
                                background: "#f6f6f6",
                                border: "1px solid #d9d9d9",
                              }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                        <Divider style={{ margin: "8px 0" }} />
                        <small style={{ color: "#888" }}>{item._id}</small>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {loading && (
            <div style={{ textAlign: "center", padding: 24 }}>
              <Spin size="large" />
            </div>
          )}

          {!hasMore && data.length > 0 && (
            <div style={{ textAlign: "center", padding: 16, color: "#888" }}>
              No more items to load
            </div>
          )}
        </div>

        {/* Model classes sidebar (right) - 25% width */}
        <div
          style={{
            width: "20vw", // Using vw units
            height: "100%",
            overflow: "auto",
            borderLeft: "10px solid #f0f0f0",
            padding: 16,
            backgroundColor: "#fafafa",
          }}
        >
          <h3 style={{ marginBottom: 16 }}>Model Classes</h3>

          <Input
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: 16 }}
            allowClear
          />

          <div style={{ marginBottom: 16 }}>
            <Space>
              <span>Selected: {selectedImages.size}</span>
              <Checkbox
                checked={selectAllTags}
                onChange={() => setSelectAllTags(!selectAllTags)}
              >
                Assign to all
              </Checkbox>
            </Space>
          </div>

          <Divider style={{ margin: "8px 0 16px" }} />

          <div style={{ display: "grid", gap: 8 }}>
            {filteredClasses.map((className) => (
              <Tooltip title={className} key={className}>
                <Button
                  block
                  onClick={() => {
                    if (selectAllTags) {
                      // Assign to all images
                      const newTags = { ...selectedTags };
                      data.forEach((img) => {
                        newTags[img._id] = [
                          ...(newTags[img._id] || []),
                          className,
                        ];
                      });
                      setSelectedTags(newTags);
                    } else if (selectedImages.size > 0) {
                      // Assign to selected images
                      const newTags = { ...selectedTags };
                      selectedImages.forEach((id) => {
                        newTags[id] = [...(newTags[id] || []), className];
                      });
                      setSelectedTags(newTags);
                    } else {
                      message.warning("Please select images first");
                    }
                  }}
                  style={{
                    textAlign: "left",
                    justifyContent: "flex-start", // <-- THIS IS IMPORTANT
                    display: "flex", // <-- Required for justifyContent to work
                    alignItems: "center", // Optional for vertical centering
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {className}
                </Button>
              </Tooltip>
            ))}
          </div>
          <Divider />
          <Button type="primary" block onClick={handleSubmitTags}>
            Submit Tags
          </Button>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Modal
        open={previewImage.visible}
        footer={null}
        onCancel={() => setPreviewImage({ ...previewImage, visible: false })}
        width="80vw"
        styles={{ padding: 0 }}
        centered
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            alt="preview"
            src={previewImage.url}
            style={{ maxHeight: "80vh", maxWidth: "100%" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            display: "flex",
            gap: 8,
          }}
        >
          <Button
            icon={<CopyOutlined />}
            onClick={() => handleCopyUrl(previewImage.url)}
          >
            Copy URL
          </Button>
        </div>
      </Modal>
    </LayoutWrapper>
  );
}
