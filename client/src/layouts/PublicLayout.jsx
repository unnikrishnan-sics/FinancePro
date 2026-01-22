import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Space, Typography, Drawer, theme } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const PublicLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const {
        token: { colorPrimary },
    } = theme.useToken();

    const menuItems = [
        { key: '/', label: 'Home' },
        { key: '/features', label: 'Features' }, // Keep features as a scroll section on Home? Or separate? Let's assume scrolling on Home for now, or just a separate page. User asked for About/Contact separate. Let's keep Features on Home for now but handled via Link if on another page.
        { key: '/about', label: 'About' },
        { key: '/contact', label: 'Contact Us' },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
        setMobileMenuOpen(false);
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh', background: '#fff' }}>
            <Header style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #f0f0f0',
                padding: '0 24px'
            }}>
                <div
                    className="demo-logo"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    <img src="/src/assets/logo.png" alt="Logo" style={{ height: 40 }} />
                </div>

                {/* Desktop Menu */}
                <Menu
                    theme="light"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        borderBottom: 'none',
                        background: 'transparent',
                        flex: 1,
                        justifyContent: 'center',
                        minWidth: 0,
                        display: window.innerWidth > 768 ? 'flex' : 'none' // Simple check, better handled via CSS media query class
                    }}
                    className="desktop-menu"
                />

                {/* Desktop Auth Buttons */}
                <Space className="desktop-auth">
                    <Button type="text" onClick={() => navigate('/login')}>Log in</Button>
                    <Button type="primary" onClick={() => navigate('/register')}>Get Started</Button>
                </Space>

                {/* Mobile Menu Button */}
                <Button
                    className="mobile-menu-btn"
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={() => setMobileMenuOpen(true)}
                    style={{ display: 'none' }}
                />
            </Header>

            <Content>
                <Outlet />
            </Content>

            <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                FinancePro ©2026
            </Footer>

            {/* Mobile Drawer */}
            <Drawer
                title="Menu"
                placement="right"
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
            >
                <Menu
                    mode="vertical"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ borderRight: 'none' }}
                />
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Button block onClick={() => navigate('/login')}>Log in</Button>
                    <Button type="primary" block onClick={() => navigate('/register')}>Get Started</Button>
                </div>
            </Drawer>

            <style>{`
        @media (max-width: 768px) {
          .desktop-menu, .desktop-auth { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
        </Layout>
    );
};

export default PublicLayout;
