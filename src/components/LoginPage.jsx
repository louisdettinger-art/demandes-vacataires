// src/components/LoginPage.jsx

import React, { useState } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from '../firebase';
import ForgotPasswordPopup from './ForgotPasswordPopup';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        try {
            const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistenceType);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Erreur de connexion :", error.code);
            setError("L'e-mail ou le mot de passe est incorrect.");
        }
    };

    return (
        <>
            <div className="login-container">
                <div className="header">
                    <img src="/nexus-login.png" alt="Logo Nexus" className="login-logo" />
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">E-mail du bureau</label>
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="Ex: dec1@monapp.com"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group remember-me">
                        <input 
                            type="checkbox" 
                            id="rememberMe" 
                            checked={rememberMe} 
                            onChange={(e) => setRememberMe(e.target.checked)} 
                        />
                        <label htmlFor="rememberMe">Se souvenir de moi</label>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="login-btn">
                        <span role="img" aria-label="connexion">🔑</span> Se connecter
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className="forgot-password-btn" onClick={() => setShowForgotPassword(true)}>
                        Mot de passe oublié ?
                    </button>
                </div>

                <div className="did-you-know">
                    <h4>Le saviez-vous ? 💡</h4>
                    <p>Nexus vient du latin, ce mot désigne un "lien", un "nœud" ou une "connexion". Notre application est le lien central qui connecte les organisateurs d'examens et les surveillants.</p>
                </div>
            </div>

            {showForgotPassword && <ForgotPasswordPopup onClose={() => setShowForgotPassword(false)} />}
        </>
    );
}

export default LoginPage;