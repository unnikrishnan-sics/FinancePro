import React, { useState } from 'react';
import { Typography, Row, Col, Card, Form, Input, Button, theme, message } from 'antd'; // Added message import
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const Contact = () => {
    const { token } = theme.useToken();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/support/contact`, values);
            messageApi.success('Message sent successfully! We will get back to you soon.');
            form.resetFields();
        } catch (error) {
            messageApi.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
            {contextHolder}
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <Title level={1}>Get in Touch</Title>
                <Paragraph style={{ fontSize: 18, color: '#64748b' }}>
                    Have questions or need support? We're here to help.
                </Paragraph>
            </div>

            <Row gutter={[48, 48]}>
                {/* Contact Info */}
                <Col xs={24} md={10}>
                    <Card bordered={false} style={{ background: '#f8fafc', height: '100%', borderRadius: 16 }}>
                        <Title level={3}>Contact Information</Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 32 }}>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <MailOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
                                <div>
                                    <Text strong style={{ display: 'block' }}>Email</Text>
                                    <Text type="secondary">support@financepro.com</Text>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <PhoneOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
                                <div>
                                    <Text strong style={{ display: 'block' }}>Phone</Text>
                                    <Text type="secondary">+1 (555) 123-4567</Text>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <EnvironmentOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
                                <div>
                                    <Text strong style={{ display: 'block' }}>Office</Text>
                                    <Text type="secondary">123 Finance Street, New York, NY 10001</Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Contact Form */}
                <Col xs={24} md={14}>
                    <Card bordered={false} style={{ height: '100%', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <Title level={3} style={{ marginBottom: 32 }}>Send us a Message</Title>
                        <Form
                            layout="vertical"
                            size="large"
                            form={form}
                            onFinish={onFinish}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="firstName" rules={[{ required: true, message: 'Required' }]}>
                                        <Input placeholder="First Name" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="lastName" rules={[{ required: true, message: 'Required' }]}>
                                        <Input placeholder="Last Name" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                                <Input placeholder="Email Address" />
                            </Form.Item>
                            <Form.Item name="message" rules={[{ required: true, message: 'Message required' }]}>
                                <TextArea rows={4} placeholder="How can we help you?" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block loading={loading}>
                                    Send Message
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Contact;
