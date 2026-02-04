import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Spin, Alert, message, theme, Tag, Divider } from 'antd';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { RiseOutlined, FallOutlined, BulbOutlined } from '@ant-design/icons';
import API from '../utils/axios';

import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

import { useParams } from 'react-router-dom';

const Analytics = () => {
    const { userId } = useParams(); // Get userId from URL if present (Admin view)
    const [data, setData] = useState({ historical: [], prediction: null, summary: null });
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const { chartType } = useTheme();

    useEffect(() => {
        fetchAnalytics();
    }, [userId]); // Re-fetch if userId changes

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            let response;
            if (userId) {
                // Admin viewing specific user
                response = await API.post('/api/v1/analytics/admin-data', { userId });
            } else {
                // Normal user viewing themselves
                response = await API.get('/api/v1/analytics/data');
            }

            setData(response.data);
        } catch (error) {
            message.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    }

    const { historical, prediction, summary } = data;

    // Combine historical and prediction for chart
    const chartData = [...historical];
    if (prediction) {
        chartData.push({
            month: prediction.month + ' (Pred)',
            income: prediction.income,
            expense: prediction.expense,
            isPrediction: true
        });
    }

    const isTrendingUp = summary?.trend === 'increasing';

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>Financial Analytics</Title>

            {/* AI Insight & Recommendations */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card
                        variant="borderless"
                        style={{
                            background: `linear-gradient(135deg, ${token.colorSuccessBg} 0%, ${token.colorBgContainer} 100%)`,
                            border: `1px solid ${token.colorSuccessBorder}`,
                            borderRadius: 16,
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
                            {/* Insight Section */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{
                                    background: token.colorSuccess,
                                    borderRadius: '50%',
                                    width: 48,
                                    height: 48,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                                }}>
                                    <BulbOutlined style={{ fontSize: 24, color: '#fff' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Title level={4} style={{ margin: '0 0 8px 0', color: token.colorSuccessText }}>AI Financial Insight</Title>
                                    <Text style={{ fontSize: 16, lineHeight: 1.6 }}>
                                        {prediction ?
                                            `Based on your spending habits, we predict your expenses will be around $${prediction.expense.toFixed(0)} next month. ${isTrendingUp ? 'Spending is trending upwards—consider budgeting!' : 'Great job! Your spending trend is stable or decreasing.'}`
                                            : 'Gathering more data to generate insights...'}
                                    </Text>
                                </div>
                            </div>

                            <Divider style={{ margin: '12px 0' }} />

                            {/* Recommendations Grid */}
                            <div>
                                <Title level={5} style={{ marginBottom: 16 }}>Smart Recommendations</Title>
                                <Row gutter={[16, 16]}>
                                    {data.recommendations && data.recommendations.length > 0 ? (
                                        data.recommendations.map((rec, index) => (
                                            <Col xs={24} md={12} key={index}>
                                                <div style={{
                                                    background: token.colorBgContainer,
                                                    padding: 20,
                                                    borderRadius: 12,
                                                    height: '100%',
                                                    border: '1px solid #f0f0f0',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                                    display: 'flex',
                                                    gap: 12
                                                }}>
                                                    <div style={{ marginTop: 4 }}>
                                                        {rec.includes('surplus') ? <RiseOutlined style={{ color: '#1677ff' }} /> :
                                                            rec.includes('spending') ? <FallOutlined style={{ color: '#ff4d4f' }} /> :
                                                                <BulbOutlined style={{ color: '#faad14' }} />}
                                                    </div>
                                                    <span style={{ fontSize: 15, color: token.colorTextSecondary }} dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, `<span style="color: ${token.colorText}; font-weight: 600;">$1</span>`) }} />
                                                </div>
                                            </Col>
                                        ))
                                    ) : (
                                        <Col span={24}>
                                            <Text type="secondary">No specific recommendations at this time. Keep tracking!</Text>
                                        </Col>
                                    )}
                                </Row>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Prediction Stats & Methodology */}
                <Col xs={24} lg={8}>
                    <Card variant="borderless" style={{ height: '100%', borderRadius: 16 }}>
                        <Statistic
                            title="Predicted Expense (Next Month)"
                            value={prediction?.expense}
                            precision={2}
                            prefix="$"
                            contentStyle={{ color: '#cf1322', fontSize: 32, fontWeight: 'bold' }}
                        />
                        <div style={{ marginTop: 16, marginBottom: 24 }}>
                            <Text type="secondary">Trend: </Text>
                            <Tag color={isTrendingUp ? 'red' : 'green'} style={{ fontSize: 14, padding: '4px 10px' }}>
                                {isTrendingUp ? <RiseOutlined /> : <FallOutlined />} {isTrendingUp ? 'Increasing' : 'Decreasing'}
                            </Tag>
                        </div>

                        <Divider />

                        <Title level={5} style={{ fontSize: 14, color: '#888' }}>HOW IT WORKS</Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e6f4ff', color: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>1</div>
                                <Text style={{ fontSize: 13 }}>Analyzes 3+ months of history</Text>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e6f4ff', color: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>2</div>
                                <Text style={{ fontSize: 13 }}>Detects spending anomalies</Text>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e6f4ff', color: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>3</div>
                                <Text style={{ fontSize: 13 }}>Advanced Predictive Analysis</Text>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Main Trend Chart */}
                <Col xs={24} md={16}>
                    <Card title="Income vs Expense Trend" variant="borderless" style={{ height: '100%', minHeight: 400 }}>
                        <div style={{ width: '100%', height: 350, minHeight: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'bar' ? (
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip contentStyle={{ backgroundColor: token.colorBgElevated, borderRadius: 8, borderColor: token.colorBorderSecondary, color: token.colorText }} itemStyle={{ color: token.colorText }} />
                                        <Legend />
                                        <Bar dataKey="income" fill={token.colorPrimary} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" fill="#ff4d4f" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : chartType === 'line' ? (
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip contentStyle={{ backgroundColor: token.colorBgElevated, borderRadius: 8, borderColor: token.colorBorderSecondary, color: token.colorText }} itemStyle={{ color: token.colorText }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="income" stroke={token.colorPrimary} strokeWidth={3} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="expense" stroke="#ff4d4f" strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                ) : (
                                    <AreaChart data={chartData}>
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
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="income" stroke={token.colorPrimary} fillOpacity={1} fill="url(#colorIncome)" />
                                        <Area type="monotone" dataKey="expense" stroke="#ff4d4f" fillOpacity={1} fill="url(#colorExpense)" />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>



            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                {/* Expense Breakdown (Pie Chart) */}
                <Col xs={24} md={12}>
                    <Card title="Expense Breakdown" variant="borderless" style={{ height: '100%' }}>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={data.expenseByCategory || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(data.expenseByCategory || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value}`} contentStyle={{ backgroundColor: token.colorBgElevated, borderRadius: 8, borderColor: token.colorBorderSecondary, color: token.colorText }} itemStyle={{ color: token.colorText }} />
                                    <Legend
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        wrapperStyle={{ paddingLeft: 20 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Top Spending Categories (List) */}
                <Col xs={24} md={12}>
                    <Card title="Top Spending Categories" variant="borderless" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {(data.expenseByCategory || []).map((item, index) => (
                                <div key={index}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text strong>{item.name}</Text>
                                        <Text>${item.value.toFixed(2)}</Text>
                                    </div>
                                    <div style={{ width: '100%', background: '#f0f0f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${(item.value / ((data.expenseByCategory || []).reduce((a, b) => a + b.value, 0) || 1)) * 100}%`,
                                                background: COLORS[index % COLORS.length],
                                                height: '100%',
                                                borderRadius: 4
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!data.expenseByCategory || data.expenseByCategory.length === 0) && (
                                <Text type="secondary">No expense data available.</Text>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div >
    );
};

export default Analytics;
