// src/components/PasswordChangePopup.jsx

import React, { useState } from 'react';

function PasswordChangePopup({ onClose, onChangePassword }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!newPassword || !confirmPassword) {
            setError('Veuillez remplir tous les champs.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        // Si tout est bon, on appelle la fonction du parent
        onChangePassword(newPassword);
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content" style={{ maxWidth: '500px' }}>
                <div className="popup-header">
                    <h2>Modifier le mot de passe</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="newPassword">Nouveau mot de passe</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    {error && <p className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
                    <button type="submit" className="login-btn">Enregistrer</button>
                </form>
            </div>
        </div>
    );
}

export default PasswordChangePopup;