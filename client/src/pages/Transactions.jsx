import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Typography, message, Space, Input, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import AddTransactionModal from '../components/AddTransactionModal';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/transactions/get-transactions`, config);
            setTransactions(data);
        } catch (error) {
            message.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/transactions/delete-transaction`, { transactionId: id }, config);
            message.success('Transaction deleted');
            fetchTransactions();
        } catch (error) {
            message.error('Failed to delete transaction');
        }
    };

    const handleExport = () => {
        // Use filteredTransactions for export so it respects the date range and search
        if (!filteredTransactions.length) {
            return message.warning('No transactions to export');
        }

        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(t => [
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
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            filters: [
                { text: 'Salary', value: 'salary' },
                { text: 'Food', value: 'food' },
                { text: 'Transport', value: 'transport' },
                { text: 'Entertainment', value: 'entertainment' },
                { text: 'Utilities', value: 'utilities' },
                { text: 'Investment', value: 'investment' },
                { text: 'Other', value: 'other' },
            ],
            onFilter: (value, record) => record.category.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text || '-',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            filters: [
                { text: 'Income', value: 'income' },
                { text: 'Expense', value: 'expense' },
            ],
            onFilter: (value, record) => record.type === value,
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
            sorter: (a, b) => a.amount - b.amount,
            render: (amount, record) => (
                <span style={{ color: record.type === 'income' ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}>
                    {record.type === 'expense' ? '-' : '+'} ${amount.toFixed(2)}
                </span>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record._id)}
                />
            ),
        },
    ];

    // Filter Logic
    const filteredTransactions = transactions.filter(item => {
        const matchesSearch = item.category.toLowerCase().includes(searchText.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()));

        let matchesDate = true;
        if (dateRange) {
            const txDate = new Date(item.date);
            const start = dateRange[0].startOf('day').toDate();
            const end = dateRange[1].endOf('day').toDate();
            matchesDate = txDate >= start && txDate <= end;
        }

        return matchesSearch && matchesDate;
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Transactions</Title>
                <Space>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                        Export CSV
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                        Add New
                    </Button>
                </Space>
            </div>

            <Card bordered={false}>
                <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Input
                        placeholder="Search by category or description..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ maxWidth: 300 }}
                    />
                    <RangePicker
                        onChange={dates => setDateRange(dates)}
                        format="MM/DD/YYYY"
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredTransactions}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <AddTransactionModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onAdd={fetchTransactions}
            />
        </div>
    );
};

export default Transactions;
