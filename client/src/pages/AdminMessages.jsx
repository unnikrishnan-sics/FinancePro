
import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Tabs, Button, Typography, message, Tooltip, Space, Modal, Descriptions, Input } from 'antd';
import { CheckOutlined, MailOutlined, MessageOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import API from '../utils/axios';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);
    const [isEditingReply, setIsEditingReply] = useState(false);
    
    const { darkMode } = useTheme();
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
        setSelectedMessage(record);
        setReplyText(record.adminResponse || '');
        setIsEditingReply(false);
        setIsModalOpen(true);
    };

    const handleSendReply = async () => {
        setReplyLoading(true);
        try {
            const { data } = await API.put(`/api/v1/support/${selectedMessage._id}/respond`, {
                responseText: replyText.trim()
            });
            message.success('Response sent successfully');
            
            // Update selectedMessage state with the new response
            setSelectedMessage(prev => ({
                ...prev,
                adminResponse: data.adminResponse,
                respondedAt: data.respondedAt,
                read: true
            }));

            // Update main messages list state optimistically
            setMessages(prev => prev.map(msg => 
                msg._id === selectedMessage._id 
                    ? { ...msg, adminResponse: data.adminResponse, respondedAt: data.respondedAt, read: true } 
                    : msg
            ));
            
            setIsEditingReply(false);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to send response');
        } finally {
            setReplyLoading(false);
        }
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
            title: 'Reply Status',
            key: 'replyStatus',
            width: 130,
            render: (_, record) => {
                if (record.type === 'FEEDBACK') {
                    return record.respondedAt ? (
                        <Tag color="success">Replied</Tag>
                    ) : (
                        <Tag color="warning">Pending</Tag>
                    );
                }
                return <Text type="secondary">-</Text>;
            }
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
                    <div style={{ marginTop: 10 }}>
                        <Descriptions column={1} bordered size="small">
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
                                    maxHeight: 150,
                                    overflowY: 'auto',
                                    background: darkMode ? '#1c1c1e' : '#f8fafc',
                                    padding: 12,
                                    borderRadius: 6
                                }}>
                                    <Text>{selectedMessage.message}</Text>
                                </div>
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${darkMode ? '#2c2c2e' : '#f0f0f0'}` }}>
                            <Title level={5} style={{ marginBottom: 12 }}>Response & Action</Title>
                            {selectedMessage.respondedAt && !isEditingReply ? (
                                <div style={{ 
                                    background: darkMode ? 'rgba(82, 196, 26, 0.08)' : '#f6ffed', 
                                    border: `1px solid ${darkMode ? 'rgba(82, 196, 26, 0.2)' : '#b7eb8f'}`,
                                    padding: 16, 
                                    borderRadius: 12,
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Responded on: {new Date(selectedMessage.respondedAt).toLocaleString()}
                                        </Text>
                                        <Button 
                                            type="link" 
                                            size="small" 
                                            onClick={() => setIsEditingReply(true)}
                                            style={{ padding: 0 }}
                                        >
                                            Edit Response
                                        </Button>
                                    </div>
                                    <Text style={{ 
                                        whiteSpace: 'pre-wrap', 
                                        fontStyle: selectedMessage.adminResponse ? 'normal' : 'italic',
                                        color: selectedMessage.adminResponse ? 'inherit' : (darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')
                                    }}>
                                        {selectedMessage.adminResponse || "Responded without a message."}
                                    </Text>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <Input.TextArea
                                        rows={4}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your response to the user here..."
                                        maxLength={1000}
                                        showCount
                                        disabled={replyLoading}
                                    />
                                    <Space style={{ alignSelf: 'flex-end' }}>
                                        {isEditingReply && (
                                            <Button 
                                                onClick={() => {
                                                    setIsEditingReply(false);
                                                    setReplyText(selectedMessage.adminResponse || '');
                                                }}
                                                disabled={replyLoading}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button
                                            type="primary"
                                            onClick={handleSendReply}
                                            loading={replyLoading}
                                            icon={<CheckOutlined />}
                                        >
                                            {isEditingReply ? 'Update Response' : 'Send Response'}
                                        </Button>
                                    </Space>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminMessages;

