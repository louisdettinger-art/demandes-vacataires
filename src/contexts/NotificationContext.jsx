// src/contexts/NotificationContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [unreadCount, setUnreadCount] = useState(() => {
        const saved = localStorage.getItem('unreadCount');
        return saved ? parseInt(saved, 10) : 0;
    });

    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
        localStorage.setItem('unreadCount', unreadCount);
    }, [notifications, unreadCount]);

    const addNotification = (message, demandeId) => {
        const newNotification = {
            id: Date.now(),
            message,
            demandeId,
            date: new Date().toISOString()
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    const markAsRead = () => {
        setUnreadCount(0);
    };

    const clearNotifications = (callback) => {
        setNotifications([]);
        setUnreadCount(0);
        if (callback) {
            callback();
        }
    };

    const value = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};