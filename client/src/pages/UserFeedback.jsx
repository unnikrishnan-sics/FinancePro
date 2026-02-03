import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Rate } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

const UserFeedback = () => {
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    // Get user info for token
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/support/feedback`,
                { message: values.message },
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    }
                }
            );
            messageApi.success('Thank you for your feedback!');
            form.resetFields();
        } catch (error) {
            messageApi.error(error.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '20px auto' }}>
            {contextHolder}
            <Card title={<Title level={4}>Share Your Feedback</Title>} bordered={false}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                    We value your input! Let us know what you think about FinancePro or suggest new features.
                </Text>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="message"
                        rules={[{ required: true, message: 'Please write something!' }]}
                    >
                        <TextArea
                            rows={6}
                            placeholder="Tell us what you like or what needs improvement..."
                            style={{ resize: 'none' }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} block>
                            Submit Feedback
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default UserFeedback;
