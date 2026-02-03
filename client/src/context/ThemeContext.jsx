import React, { createContext, useState, useEffect, useContext } from 'react';
import { theme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Load from local storage or default
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    const [primaryColor, setPrimaryColor] = useState(() => {
        return localStorage.getItem('primaryColor') || '#4f46e5';
    });

    const [compactMode, setCompactMode] = useState(() => {
        const saved = localStorage.getItem('compactMode');
        return saved ? JSON.parse(saved) : false;
    });

    const [borderRadius, setBorderRadius] = useState(() => {
        const saved = localStorage.getItem('borderRadius');
        return saved ? parseInt(saved) : 8;
    });

    const [chartType, setChartType] = useState(() => {
        return localStorage.getItem('chartType') || 'area';
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('primaryColor', primaryColor);
    }, [primaryColor]);

    useEffect(() => {
        localStorage.setItem('compactMode', JSON.stringify(compactMode));
    }, [compactMode]);

    useEffect(() => {
        localStorage.setItem('borderRadius', borderRadius);
    }, [borderRadius]);

    useEffect(() => {
        localStorage.setItem('chartType', chartType);
    }, [chartType]);

    const toggleTheme = () => setDarkMode(!darkMode);
    const changeColor = (color) => setPrimaryColor(color);
    const toggleCompact = () => setCompactMode(!compactMode);
    const changeBorderRadius = (radius) => setBorderRadius(radius);
    const changeChartType = (type) => setChartType(type);

    return (
        <ThemeContext.Provider value={{
            darkMode, primaryColor, compactMode, borderRadius, chartType,
            toggleTheme, changeColor, toggleCompact, changeBorderRadius, changeChartType
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
