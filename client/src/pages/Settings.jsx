import React, { useState, useEffect } from 'react';
import { Card, Typography, Switch, Row, Col, Tooltip, Divider, Button, Slider, Radio, Tabs, Form, Input, message, InputNumber } from 'antd';
import { CheckOutlined, FormatPainterOutlined, UserOutlined, SaveOutlined, LockOutlined, BellOutlined } from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const { Title, Text } = Typography;

const Settings = () => {
    const {
        darkMode, primaryColor, compactMode, borderRadius, chartType,
        toggleTheme, changeColor, toggleCompact, changeBorderRadius, changeChartType
    } = useTheme();

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('userInfo'));
        if (user) {
            setUserInfo(user);
            form.setFieldsValue({
                name: user.name,
                email: user.email,
                highValueThreshold: user.highValueThreshold || 1000
            });
        }
    }, [form]);

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
                userId: userInfo._id,
                ...values
            }, config);

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUserInfo(data);
            message.success('Profile updated successfully!');
        } catch (error) {
            message.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const colors = [
        '#4f46e5', '#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96', '#13c2c2',
    ];

    // --- Tab Components ---
    const AppearanceSettings = () => (
        <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
                <Card title={<><FormatPainterOutlined /> Theme Preferences</>} bordered={false}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <Text strong style={{ fontSize: 16 }}>Dark Mode</Text>
                            <div style={{ color: '#888', fontSize: 12 }}>Switch between light and dark themes</div>
                        </div>
                        <Switch checked={darkMode} onChange={toggleTheme} />
                    </div>
                    <Divider />
                    <div>
                        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>Brand Color</Text>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {colors.map(color => (
                                <Tooltip title={color} key={color}>
                                    <div
                                        onClick={() => changeColor(color)}
                                        style={{
                                            width: 36, height: 36, borderRadius: '50%', backgroundColor: color, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: primaryColor === color ? '2px solid #fff' : '2px solid transparent',
                                            boxShadow: primaryColor === color ? '0 0 0 2px #d9d9d9' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {primaryColor === color && <CheckOutlined style={{ color: '#fff' }} />}
                                    </div>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                    <Divider />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <Text strong style={{ fontSize: 16 }}>Compact Mode</Text>
                            <div style={{ color: '#888', fontSize: 12 }}>Increase data density</div>
                        </div>
                        <Switch checked={compactMode} onChange={toggleCompact} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text strong style={{ fontSize: 16 }}>Border Radius</Text>
                            <Text type="secondary">{borderRadius}px</Text>
                        </div>
                        <Slider min={0} max={20} value={borderRadius} onChange={changeBorderRadius} tooltip={{ open: false }} />
                    </div>
                    <Divider />
                    <div>
                        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>Chart Style</Text>
                        <Radio.Group value={chartType} onChange={e => changeChartType(e.target.value)} buttonStyle="solid">
                            <Radio.Button value="area">Wave (Area)</Radio.Button>
                            <Radio.Button value="bar">Bar</Radio.Button>
                            <Radio.Button value="line">Line</Radio.Button>
                        </Radio.Group>
                    </div>
                </Card>
            </Col>
            <Col xs={24} md={12}>
                <Card title="Preview" bordered={false}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Button type="primary">Primary Button</Button>
                        <Button>Default Button</Button>
                        <div style={{ padding: 12, background: primaryColor, borderRadius: 6, color: '#fff' }}>
                            <Text style={{ color: '#fff' }}>Brand Colored Box</Text>
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>
    );

    const ProfileSettings = () => (
        <Card bordered={false} style={{ maxWidth: 800 }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
            >
                <Title level={4}><UserOutlined /> Profile Details</Title>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                            <Input prefix={<UserOutlined />} placeholder="Your Name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                            <Input prefix={<UserOutlined />} placeholder="email@example.com" />
                        </Form.Item>
                    </Col>
                </Row>
                <Divider />

                <Title level={4}><BellOutlined /> Notification Settings</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Configure when you want to be alerted.
                </Text>

                <Form.Item
                    name="highValueThreshold"
                    label="High Spending Alert Limit ($)"
                    help="You will be notified if a single expense exceeds this amount."
                >
                    <InputNumber
                        prefix="$"
                        style={{ width: '100%' }}
                        min={0}
                        size="large"
                    />
                </Form.Item>

                <Divider />

                <Title level={4}><LockOutlined /> Security</Title>
                <Form.Item name="password" label="New Password">
                    <Input.Password placeholder="Leave blank to keep current password" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );

    const items = userInfo.isAdmin ? [
        { key: '2', label: 'Appearance', children: <AppearanceSettings /> },
    ] : [
        { key: '1', label: 'My Profile', children: <ProfileSettings /> },
        { key: '2', label: 'Appearance', children: <AppearanceSettings /> },
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>Settings</Title>
            <Tabs defaultActiveKey={userInfo.isAdmin ? '2' : '1'} items={items} type="card" size="large" />
        </div>
    );
};

export default Settings;
