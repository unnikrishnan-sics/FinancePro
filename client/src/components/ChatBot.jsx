import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Input, Typography, Avatar, Space, Spin, theme } from 'antd';
import { MessageFilled, CloseOutlined, SendOutlined, RobotOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useTheme } from '../context/ThemeContext';

const { Text, Title } = Typography;

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I am your FinancePro Assistant. How can I help you manage your money today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const { token } = theme.useToken();
    const { darkMode } = useTheme();

    // Initialize Gemini
    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    if (!apiKey) {
        console.warn("Gemini API Key (VITE_GEMINI_KEY) is missing in .env");
    }
    const genAI = new GoogleGenerativeAI(apiKey || "");
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        systemInstruction: "You are FinancePro AI, a professional and friendly financial assistant for the FinancePro app. Help users understand their finances, explain financial concepts (like budgeting, investing, and savings), and guide them through app features. Be concise and encouraging. Avoid providing specific investment advice on stocks; instead, focus on general principles.",
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);

        try {
            // Gemini history MUST start with a user message. 
            // We filter out any initial model messages from the history.
            const history = messages
                .filter((m, idx) => !(idx === 0 && m.role === 'model'))
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }],
                }));

            const chat = model.startChat({ history });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'model', text: text }]);
        } catch (error) {
            console.error("Gemini Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'model', text: 'Chat cleared. How else can I assist you?' }]);
    };

    return (
        <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
            {/* Floating Bubble Icon */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Button
                            type="primary"
                            shape="circle"
                            size="large"
                            icon={<MessageFilled style={{ fontSize: 24 }} />}
                            onClick={() => setIsOpen(true)}
                            style={{
                                width: 60,
                                height: 60,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none'
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    >
                        <Card
                            styles={{ 
                                body: { 
                                    padding: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%'
                                } 
                            }}
                            style={{
                                width: 380,
                                height: 550,
                                borderRadius: 24,
                                overflow: 'hidden',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                                background: darkMode ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                                bottom: 20,
                                right: 0
                            }}
                        >
                            {/* Header - Premium Gradient */}
                            <div style={{
                                padding: '20px',
                                background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                color: '#fff',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}>
                                <Space size={12}>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: 8,
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <RobotOutlined style={{ fontSize: 20 }} />
                                    </div>
                                    <div>
                                        <Text strong style={{ color: '#fff', display: 'block', fontSize: 16, lineHeight: 1.2 }}>FinancePro AI</Text>
                                        <Space size={4}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#52c41a' }} />
                                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Always active</Text>
                                        </Space>
                                    </div>
                                </Space>
                                <Space>
                                    <Button 
                                        type="text" 
                                        icon={<DeleteOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />} 
                                        onClick={clearChat} 
                                        size="small"
                                        style={{ background: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <Button 
                                        type="text" 
                                        icon={<CloseOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />} 
                                        onClick={() => setIsOpen(false)} 
                                        style={{ background: 'rgba(255,255,255,0.1)' }}
                                    />
                                </Space>
                            </div>

                            {/* Messages Area */}
                            <div 
                                ref={scrollRef}
                                style={{
                                    flex: 1,
                                    padding: '24px 20px',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 20,
                                    background: darkMode ? 'transparent' : '#f8fafc'
                                }}
                            >
                                {messages.map((msg, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            width: '100%'
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: '85%',
                                            padding: '12px 16px',
                                            borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            background: msg.role === 'user' 
                                                ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)` 
                                                : (darkMode ? '#2c2c2e' : '#fff'),
                                            color: msg.role === 'user' ? '#fff' : token.colorText,
                                            boxShadow: msg.role === 'user' 
                                                ? '0 4px 12px rgba(22, 119, 255, 0.2)' 
                                                : '0 2px 8px rgba(0,0,0,0.05)',
                                            fontSize: 14,
                                            lineHeight: 1.6,
                                            border: msg.role === 'model' && !darkMode ? '1px solid #edf2f7' : 'none'
                                        }}>
                                            {msg.text}
                                        </div>
                                        <Text type="secondary" style={{ fontSize: 10, marginTop: 6, fontWeight: 500, letterSpacing: '0.02em' }}>
                                            {msg.role === 'user' ? 'YOU' : 'FINANCEPRO AI'}
                                        </Text>
                                    </motion.div>
                                ))}
                                {loading && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <Space orientation="vertical" size={0}>
                                            <Spin size="small" />
                                        </Space>
                                        <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>AI is crafting a response...</Text>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div style={{ 
                                padding: '12px 16px', 
                                background: darkMode ? '#1c1c1e' : '#fff', 
                                borderTop: `1px solid ${darkMode ? '#2c2c2e' : '#edf2f7'}` 
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: 12, 
                                    background: darkMode ? '#2c2c2e' : '#f1f5f9',
                                    padding: '6px 6px 6px 16px',
                                    borderRadius: 24,
                                    alignItems: 'center'
                                }}>
                                    <Input 
                                        placeholder="Ask about your finances..." 
                                        value={input}
                                        variant="borderless"
                                        onChange={(e) => setInput(e.target.value)}
                                        onPressEnter={handleSendMessage}
                                        disabled={loading}
                                        style={{ padding: 0, fontSize: 14 }}
                                    />
                                    <Button 
                                        type="primary" 
                                        shape="circle" 
                                        icon={<SendOutlined style={{ fontSize: 16 }} />} 
                                        onClick={handleSendMessage}
                                        disabled={!input.trim() || loading}
                                        style={{ 
                                            width: 36, 
                                            height: 36, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 10px rgba(22, 119, 255, 0.3)'
                                        }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Tooltip wrapper helper (since we didn't import Tooltip from antd at the top)
import { Tooltip } from 'antd';

export default ChatBot;
