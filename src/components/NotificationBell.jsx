// src/components/NotificationBell.jsx

import React from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationContext';

function NotificationBell({ onClick }) {
    const { unreadCount } = useNotifications();

    return (
        <button className="notification-bell" onClick={onClick}>
            <FaBell />
            {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
            )}
        </button>
    );
}

export default NotificationBell;