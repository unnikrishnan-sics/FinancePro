import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, DatePicker, Button, message, Space, Tag, Divider } from 'antd';
import { DollarOutlined, ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import API from '../utils/axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const Reports = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    const fetchReport = React.useCallback(async () => {
        setLoading(true);
        try {
            const month = selectedDate.month() + 1;
            const year = selectedDate.year();
            const { data } = await API.get(`/api/v1/analytics/monthly-report?month=${month}&year=${year}`);
            setReportData(data);
        } catch {
            message.error('Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleExport = () => {
        if (!reportData || !reportData.transactions.length) {
            return message.warning('No data to export');
        }

        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...reportData.transactions.map(t => [
                new Date(t.date).toLocaleDateString(),
                t.type,
                t.category,
                `"${(t.description || '').replace(/"/g, '""')}"`,
                t.amount
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `monthly_report_${selectedDate.format('MMM_YYYY')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString()
        },
        { title: 'Category', dataIndex: 'category', key: 'category' },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'income' ? 'success' : 'error'}>
                    {type.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount, record) => (
                <span style={{ color: record.type === 'income' ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}>
                    {record.type === 'expense' ? '-' : '+'} ${amount.toFixed(2)}
                </span>
            )
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Monthly Reports</Title>
                <Space>
                    <DatePicker
                        picker="month"
                        value={selectedDate}
                        onChange={(date) => date && setSelectedDate(date)}
                        format="MMMM YYYY"
                        allowClear={false}
                    />
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                        disabled={!reportData}
                    >
                        Export Report
                    </Button>
                </Space>
            </div>

            {reportData && (
                <>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Card bordered={false}>
                                <Statistic
                                    title="Total Income"
                                    value={reportData.summary.totalIncome}
                                    precision={2}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<ArrowUpOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card bordered={false}>
                                <Statistic
                                    title="Total Expenses"
                                    value={reportData.summary.totalExpense}
                                    precision={2}
                                    valueStyle={{ color: '#cf1322' }}
                                    prefix={<ArrowDownOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card bordered={false}>
                                <Statistic
                                    title="Net Savings"
                                    value={reportData.summary.savings}
                                    precision={2}
                                    valueStyle={{ color: reportData.summary.savings >= 0 ? '#1677ff' : '#cf1322' }}
                                    prefix={<DollarOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                        <Col xs={24} lg={12}>
                            <Card title="Expense Breakdown" bordered={false} style={{ height: '100%' }}>
                                <div style={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={reportData.expenseByCategory}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {reportData.expenseByCategory.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="Daily Spending Trend" bordered={false} style={{ height: '100%' }}>
                                <div style={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.dailyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="expense" fill="#ff4d4f" name="Expense" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="income" fill="#52c41a" name="Income" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Monthly Transactions" bordered={false} style={{ marginTop: 24 }}>
                        <Table
                            dataSource={reportData.transactions}
                            columns={columns}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </>
            )}
        </div>
    );
};

export default Reports;
