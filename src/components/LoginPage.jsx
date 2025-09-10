// src/components/LoginPage.jsx

import React, { useState } from 'react';
// On importe les outils nécessaires de Firebase
import { 
    signInWithEmailAndPassword, 
    setPersistence, 
    browserSessionPersistence, 
    browserLocalPersistence 
} from "firebase/auth";
import { auth } from '../firebase';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // On ajoute un état pour la case à cocher, cochée par défaut pour la commodité
    const [rememberMe, setRememberMe] = useState(true);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            // On choisit le type de persistance AVANT de se connecter
            const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistenceType);

            // On tente la connexion
            await signInWithEmailAndPassword(auth, email, password);
            // La connexion est réussie. App.jsx va détecter le changement.

        } catch (error) {
            console.error("Erreur de connexion :", error.code);
            setError("L'e-mail ou le mot de passe est incorrect.");
        }
    };

    return (
        <div className="login-container">
            <div className="header">
                <h1>Demande d'intervenants pour les examens et concours</h1>
                <p>Connectez-vous pour accéder à votre espace de gestion</p>
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

                {/* On ajoute la case à cocher */}
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

                <button type="submit" className="login-btn">Se connecter</button>
            </form>
        </div>
    );
}

export default LoginPage;