// src/components/NotificationPanel.jsx

import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';

// onClear est la nouvelle prop pour fermer le panneau
function NotificationPanel({ onNotificationClick, onClear }) {
    const { notifications, clearNotifications } = useNotifications();

    const handleClear = () => {
        clearNotifications(onClear); // On appelle clearNotifications avec la fonction de fermeture
    };

    return (
        <div className="notification-panel">
            {notifications.length === 0 ? (
                <p className="no-notification">Aucune notification</p>
            ) : (
                <>
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
                    <div className="notification-footer">
                        <button className="clear-notifications-btn" onClick={handleClear}>
                            Effacer les notifications
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default NotificationPanel;