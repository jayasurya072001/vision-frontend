import { Card, Tag, Typography, Divider } from "antd";
const { Text } = Typography;

const PredictionDetailsCard = ({ predictions }) => {
  return (
    <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
      {predictions.map((pred) => (
        <Card
          key={pred._id}
          style={{ marginBottom: 16 }}
          title={`Model: ${pred.model_name} | Version: ${pred.version}`}
        >
          <div>
            <Text strong>Violation Tags: </Text>
            {pred.violationTags.map((tag) => (
              <Tag key={tag} color="red">
                {tag}
              </Tag>
            ))}
          </div>
          <Divider />
          <div>
            <Text strong>Predictions:</Text>
            {Object.entries(pred.predictions).map(([key, val]) => (
              <div key={key} style={{ margin: "4px 0" }}>
                <Tag color={val > 0.5 ? "volcano" : "blue"}>
                  {key}: {(val * 100).toFixed(2)}%
                </Tag>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PredictionDetailsCard;
