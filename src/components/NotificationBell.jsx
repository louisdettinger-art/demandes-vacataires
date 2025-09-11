// src/components/NotificationBell.jsx

import React from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationContext';

function NotificationBell({ onClick }) {
    const { unreadCount } = useNotifications();
    const hasUnread = unreadCount > 0;

    return (
        <button className="notification-bell" onClick={onClick}>
            {/* On ajoute la classe "unread" si il y a des notifications non lues */}
            <FaBell className={hasUnread ? 'unread' : ''} />
            {hasUnread && (
                <span className="notification-badge">{unreadCount}</span>
            )}
        </button>
    );
}

export default NotificationBell;