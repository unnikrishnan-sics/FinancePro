import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import API from '../utils/axios';

const { Title, Text } = Typography;

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await API.post('/api/auth/forgotpassword', { email: values.email });
            setSuccess(true);
            messageApi.success('Email sent! Check your inbox.');
        } catch (error) {
            messageApi.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: 20
        }}>
            {contextHolder}
            <Card style={{ width: '100%', maxWidth: 400, textAlign: 'center' }} variant="borderless">
                <div style={{ marginBottom: 24 }}>
                    <Title level={3}>Forgot Password?</Title>
                    <Text type="secondary">Enter your email and we'll send you a reset link.</Text>
                </div>

                {success ? (
                    <div>
                        <div style={{ color: '#52c41a', fontSize: 48, marginBottom: 16 }}>
                            <MailOutlined />
                        </div>
                        <Title level={4}>Check your mail</Title>
                        <Text>We've sent password reset instructions to your email.</Text>
                        <div style={{ marginTop: 24 }}>
                            <Link to="/login">
                                <Button type="default" icon={<ArrowLeftOutlined />}>Back to Login</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <Form
                        name="forgot_password"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your Email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Email Address" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block>
                                Send Reset Link
                            </Button>
                        </Form.Item>

                        <Link to="/login" style={{ display: 'block', marginTop: 12 }}>
                            <ArrowLeftOutlined /> Back to Login
                        </Link>
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default ForgotPassword;
