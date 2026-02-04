import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Spin, message, theme, Divider, Alert } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { RobotOutlined, PieChartOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';
import API from '../utils/axios';

const { Title, Text } = Typography;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const AdminSystemAnalytics = () => {
    const [data, setData] = useState({ expensePie: [], incomePie: [], trendData: [], aiReport: [] });
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();

    useEffect(() => {
        fetchSystemAnalytics();
    }, []);

    const fetchSystemAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/api/v1/admin/system-analytics');
            setData(data);
        } catch (error) {
            message.error('Failed to load system analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>System-Wide Financial Analytics</Title>

            {/* AI Report Section */}
            <Card style={{ marginBottom: 24, background: token.colorSuccessBg, borderColor: token.colorSuccessBorder }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <RobotOutlined style={{ fontSize: 32, color: token.colorSuccess }} />
                    <div>
                        <Title level={4} style={{ marginTop: 0 }}>AI System Report</Title>
                        {data.aiReport && data.aiReport.map((line, index) => (
                            <div key={index} style={{ marginBottom: 8, fontSize: 16, color: token.colorText }}>
                                <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <Row gutter={[24, 24]}>
                {/* Global Trend */}
                <Col span={24}>
                    <Card title="Global Money Volume (Income vs Expense)" variant="borderless" style={{ minHeight: 400 }}>
                        <div style={{ width: '100%', height: 350, minHeight: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={data.trendData}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={token.colorPrimary} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={token.colorPrimary} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: token.colorBgElevated, borderRadius: 8, borderColor: token.colorBorderSecondary }}
                                        itemStyle={{ color: token.colorText }}
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="income" stroke={token.colorPrimary} fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="expense" stroke="#ff4d4f" fillOpacity={1} fill="url(#colorExpense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Spending by Category */}
                <Col xs={24} lg={12}>
                    <Card title="What People Spend On" variant="borderless" style={{ height: '100%', minHeight: 400 }}>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={data.expensePie}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.expensePie.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `$${value}`}
                                        contentStyle={{ backgroundColor: token.colorBgElevated, borderRadius: 8, borderColor: token.colorBorderSecondary }}
                                        itemStyle={{ color: token.colorText }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Sources of Income */}
                <Col xs={24} lg={12}>
                    <Card title="How People Get Money (Income Sources)" variant="borderless" style={{ height: '100%', minHeight: 400 }}>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={data.incomePie} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" width={100} />
                                    <Tooltip
                                        cursor={{ fill: token.colorFillAlter }}
                                        contentStyle={{ backgroundColor: token.colorBgElevated, borderRadius: 8, borderColor: token.colorBorderSecondary }}
                                        itemStyle={{ color: token.colorText }}
                                    />
                                    <Legend />
                                    <Bar dataKey="value" fill="#52c41a" radius={[0, 4, 4, 0]} name="Total Amount" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminSystemAnalytics;
