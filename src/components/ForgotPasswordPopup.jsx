// src/components/ForgotPasswordPopup.jsx

import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

function ForgotPasswordPopup({ onClose }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!email) {
            setError("Veuillez entrer une adresse e-mail.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Un e-mail de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception.");
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'e-mail:", error);
            setError("Impossible d'envoyer l'e-mail. Vérifiez que l'adresse est correcte.");
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content" style={{ maxWidth: '450px' }}>
                <div className="popup-header">
                    <h2>Mot de passe oublié</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '15px' }}>
                        Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
                    </p>
                    <div className="form-group">
                        <label htmlFor="reset-email">E-mail du bureau</label>
                        <input
                            type="email"
                            id="reset-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {message && <p style={{ color: 'green', marginBottom: '15px' }}>{message}</p>}
                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="login-btn">Envoyer le lien</button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPasswordPopup;