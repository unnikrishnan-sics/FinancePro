import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/axios';

const { Title, Text } = Typography;

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        if (values.password !== values.confirmPassword) {
            return message.error("Passwords don't match");
        }

        setLoading(true);
        try {
            await API.put(`/api/auth/resetpassword/${resetToken}`, {
                password: values.password
            });
            message.success('Password reset successfully!');
            navigate('/login');
        } catch (error) {
            message.error(error.response?.data?.message || 'Invalid or expired token');
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
            <Card style={{ width: '100%', maxWidth: 400, textAlign: 'center' }} bordered={false}>
                <div style={{ marginBottom: 24 }}>
                    <Title level={3}>Reset Password</Title>
                    <Text type="secondary">Enter your new password below.</Text>
                </div>

                <Form
                    name="reset_password"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your new Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        rules={[{ required: true, message: 'Please confirm your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Update Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ResetPassword;
