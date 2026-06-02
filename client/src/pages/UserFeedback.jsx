import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message, Tag, List, Avatar, Divider, Space } from 'antd';
import { SendOutlined, ClockCircleOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import API from '../utils/axios';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const UserFeedback = () => {
    const [loading, setLoading] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const { darkMode } = useTheme();

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const { data } = await API.get('/api/v1/support/my-feedback');
            setFeedbacks(data);
        } catch (error) {
            console.error('Failed to load feedback history', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await API.post('/api/v1/support/feedback', { message: values.message });
            messageApi.success('Thank you for your feedback!');
            form.resetFields();
            fetchHistory(); // Refresh history immediately
        } catch (error) {
            messageApi.error(error.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 700, margin: '20px auto' }}>
            {contextHolder}
            
            {/* Feedback Submission Form */}
            <Card 
                title={<Title level={4} style={{ margin: 0 }}>Share Your Feedback</Title>} 
                bordered={false}
                style={{
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    background: darkMode ? 'rgba(28, 28, 30, 0.6)' : '#fff',
                    backdropFilter: 'blur(10px)',
                    marginBottom: 30
                }}
            >
                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                    We value your input! Let us know what you think about FinancePro or suggest new features. Our support team responds to every inquiry!
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
                            rows={4}
                            placeholder="Tell us what you like or what needs improvement..."
                            style={{ 
                                resize: 'none', 
                                borderRadius: 12,
                                background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc' 
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} block style={{ borderRadius: 12, height: 40 }}>
                            Submit Feedback
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/* Feedback History Section */}
            <Card
                title={<Title level={4} style={{ margin: 0 }}>Your Feedback History</Title>}
                bordered={false}
                style={{
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    background: darkMode ? 'rgba(28, 28, 30, 0.6)' : '#fff',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <List
                    loading={historyLoading}
                    dataSource={feedbacks}
                    locale={{ emptyText: 'No feedback submitted yet. Your history will appear here!' }}
                    renderItem={(item) => (
                        <List.Item style={{ display: 'block', padding: '20px 0', borderBottom: `1px solid ${darkMode ? '#2c2c2e' : '#f1f5f9'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                <Space>
                                    <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        {new Date(item.createdAt).toLocaleString()}
                                    </Text>
                                </Space>
                                <Tag color={item.respondedAt ? 'success' : 'warning'} style={{ borderRadius: 6, fontWeight: 500 }}>
                                    {item.respondedAt ? 'Responded' : 'Pending Review'}
                                </Tag>
                            </div>

                            {/* User Feedback Bubble */}
                            <div style={{
                                padding: '12px 16px',
                                background: darkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                                borderRadius: '12px 12px 12px 0px',
                                marginBottom: (item.respondedAt && item.adminResponse) ? 16 : 0,
                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#edf2f7'}`
                            }}>
                                <Text>{item.message}</Text>
                            </div>

                            {/* Admin Response Bubble */}
                            {item.respondedAt && item.adminResponse && (
                                <div style={{
                                    marginLeft: 24,
                                    padding: '16px',
                                    background: darkMode ? 'rgba(82, 196, 26, 0.06)' : '#f6ffed',
                                    border: `1px solid ${darkMode ? 'rgba(82, 196, 26, 0.15)' : '#d9f7be'}`,
                                    borderRadius: '12px 12px 0px 12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <Avatar 
                                            size="small" 
                                            style={{ backgroundColor: '#52c41a' }} 
                                            icon={<CustomerServiceOutlined />} 
                                        />
                                        <Text strong style={{ fontSize: 13, color: '#52c41a' }}>Admin Response</Text>
                                        <Divider type="vertical" />
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {new Date(item.respondedAt || item.updatedAt).toLocaleString()}
                                        </Text>
                                    </div>
                                    <Text style={{ display: 'block', paddingLeft: 4 }}>{item.adminResponse}</Text>
                                </div>
                            )}
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default UserFeedback;
