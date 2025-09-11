// src/components/ConfirmationPopup.jsx

import React from 'react';

function ConfirmationPopup({ message, onConfirm, onCancel }) {
    return (
        <div className="popup-overlay">
            <div className="popup-content" style={{ maxWidth: '450px', textAlign: 'center' }}>
                <div className="popup-header" style={{ justifyContent: 'center' }}>
                    <h2>Confirmation requise</h2>
                </div>
                <p style={{ marginBottom: '30px', fontSize: '16px' }}>{message}</p>
                <div className="annulation-actions" style={{ justifyContent: 'center' }}>
                    <button className="annuler-btn" onClick={onCancel}>Annuler</button>
                    <button className="confirm-delete-btn" onClick={onConfirm}>Confirmer</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationPopup;