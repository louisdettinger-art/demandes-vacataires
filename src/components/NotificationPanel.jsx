// src/components/NotificationPanel.jsx

import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';

function NotificationPanel({ onNotificationClick }) {
    const { notifications } = useNotifications();

    if (notifications.length === 0) {
        return (
            <div className="notification-panel">
                <p>Aucune notification</p>
            </div>
        );
    }

    return (
        <div className="notification-panel">
            <ul>
                {notifications.map(notif => (
                    <li key={notif.id} onClick={() => onNotificationClick(notif.demandeId)}>
                        <div className="notification-message">{notif.message}</div>
                        <div className="notification-date">
                            {new Date(notif.date).toLocaleString('fr-FR')}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NotificationPanel;