// src/components/AlertPopup.jsx

import React from 'react';

function AlertPopup({ title, message, onClose }) {
    return (
        <div className="popup-overlay">
            <div className="popup-content" style={{ maxWidth: '500px', textAlign: 'center' }}>
                <div className="popup-header" style={{ justifyContent: 'center' }}>
                    <h2>{title}</h2>
                </div>
                {/* On utilise whiteSpace pour que les retours à la ligne (\n) fonctionnent */}
                <p style={{ fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '30px' }}>
                    {message}
                </p>
                <button className="submit-btn" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </div>
    );
}

export default AlertPopup;