import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { fetchTeamMembers, createTeamMember } from "../services/team-member"; // define below
import { getUser } from "../utils/auth"; // assuming you store user info here
import LayoutWrapper from "../components/LayoutWrapper";
import { useMediaQuery } from "react-responsive";

const { Option } = Select;

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const role = getUser().role; // current user info: { role: "admin", ... }
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await fetchTeamMembers();
      setMembers(data);
    } catch (err) {
      message.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAdd = async (values) => {
    try {
      await createTeamMember(values);
      message.success("Team member added successfully");
      setAddModalVisible(false);
      form.resetFields();
      loadMembers();
    } catch (err) {
      message.error("Failed to add member");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Created At", dataIndex: "created_at", key: "created_at" },
  ];

  return (
    <LayoutWrapper>
      <div
        style={{
          padding: "16px",
          background: "#1a1a1a",
          color: "#fff",
          width: isSmallScreen ? "70vw" : "93vw",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ color: "#fff" }}>Team Members</h2>
          {role === "admin" && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Add Member
            </Button>
          )}
        </div>

        <Table
          dataSource={members}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          style={{ marginTop: 16 }}
          scroll={{ x: "max-content" }}
        />

        <Modal
          title="Add Team Member"
          open={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          onOk={() => form.submit()}
          okText="Add"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAdd}
            initialValues={{ role: "analyst" }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, type: "email", message: "Enter valid email" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Enter password" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
              <Select>
                <Option value="admin">Admin</Option>
                <Option value="lead">Lead</Option>
                <Option value="analyst">Analyst</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutWrapper>
  );
}
