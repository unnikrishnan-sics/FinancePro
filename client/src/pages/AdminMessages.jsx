
import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Tabs, Button, Typography, message, Tooltip, Space, Modal, Descriptions } from 'antd';
import { CheckOutlined, MailOutlined, MessageOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import API from '../utils/axios';

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
            const { data } = await API.get('/api/v1/support/all');
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
            await API.put(`/api/v1/support/${id}/read`, {});
            message.success('Marked as read');

            // Optimistic update
            setMessages(prev => prev.map(msg => msg._id === id ? { ...msg, read: true } : msg));
        } catch (error) {
            message.error('Action failed');
        }
    };

    const openMessageDetailsModal = (record) => {
        console.log('Opening message details modal for record:', record);
        console.trace('Modal trigger trace:');
        setSelectedMessage(record);
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: 'Status',
            dataIndex: 'read',
            width: 100,
            onCell: () => ({ onClick: (e) => e.stopPropagation() }),
            render: (read) => (
                <span
                    style={{ color: read ? '#64748b' : '#ef4444', fontWeight: 500 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {read ? 'Read' : 'New'}
                </span>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            width: 120,
            onCell: () => ({ onClick: (e) => e.stopPropagation() }),
            render: (type) => (
                <span
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontWeight: 500,
                        color: type === 'CONTACT' ? '#3b82f6' : '#a855f7'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {type === 'CONTACT' ? <MailOutlined /> : <MessageOutlined />}
                    {type}
                </span>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            width: 150,
            onCell: () => ({ onClick: (e) => e.stopPropagation() }),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: 200,
            onCell: () => ({ onClick: (e) => e.stopPropagation() }),
        },
        {
            title: 'Message',
            dataIndex: 'message',
            ellipsis: true,
            onCell: () => ({ onClick: (e) => e.stopPropagation() }),
            render: (text) => (
                <span>
                    {text.substring(0, 50)}...
                </span>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            width: 150,
            onCell: () => ({ onClick: (e) => e.stopPropagation() }),
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
                            onClick={(e) => { e.stopPropagation(); openMessageDetailsModal(record); }}
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

