
import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Tabs, Button, Typography, message, Tooltip, Space, Modal, Descriptions } from 'antd';
import { CheckOutlined, MailOutlined, MessageOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/support/all`, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            setMessages(data);
        } catch (error) {
            message.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const markAsRead = async (id, e) => {
        e.stopPropagation(); // Prevent row click
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/v1/support/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            message.success('Marked as read');

            // Optimistic update
            setMessages(prev => prev.map(msg => msg._id === id ? { ...msg, read: true } : msg));
        } catch (error) {
            message.error('Action failed');
        }
    };

    const handleRowClick = (record) => {
        setSelectedMessage(record);
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: 'Status',
            dataIndex: 'read',
            width: 100,
            render: (read) => (
                <Tag color={read ? 'default' : 'red'}>
                    {read ? 'Read' : 'New'}
                </Tag>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            width: 120,
            render: (type) => (
                <Tag color={type === 'CONTACT' ? 'blue' : 'purple'} icon={type === 'CONTACT' ? <MailOutlined /> : <MessageOutlined />}>
                    {type}
                </Tag>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            width: 150,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: 200,
        },
        {
            title: 'Message',
            dataIndex: 'message',
            ellipsis: true,
            render: (text) => (
                <span style={{ cursor: 'pointer', color: '#1677ff' }}>
                    {text.substring(0, 50)}...
                </span>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            width: 150,
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={(e) => { e.stopPropagation(); handleRowClick(record); }}
                        />
                    </Tooltip>
                    {!record.read && (
                        <Tooltip title="Mark as Read">
                            <Button
                                type="text"
                                icon={<CheckOutlined style={{ color: '#52c41a' }} />}
                                onClick={(e) => markAsRead(record._id, e)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Messages & Support</Title>
                <Button icon={<ReloadOutlined />} onClick={fetchMessages} loading={loading}>Refresh</Button>
            </div>

            <Card bordered={false}>
                <Table
                    columns={columns}
                    dataSource={messages}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                        style: { cursor: 'pointer' }
                    })}
                />
            </Card>

            <Modal
                title="Message Details"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedMessage && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="From">{selectedMessage.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">
                            <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Type">
                            <Tag color={selectedMessage.type === 'CONTACT' ? 'blue' : 'purple'}>
                                {selectedMessage.type}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Date">
                            {new Date(selectedMessage.createdAt).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={selectedMessage.read ? 'green' : 'red'}>
                                {selectedMessage.read ? 'Read' : 'Unread'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Message">
                            <div style={{
                                whiteSpace: 'pre-wrap',
                                maxHeight: 300,
                                overflowY: 'auto',
                                background: '#f8fafc',
                                padding: 12,
                                borderRadius: 6
                            }}>
                                <Text>{selectedMessage.message}</Text>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default AdminMessages;

