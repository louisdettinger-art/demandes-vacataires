import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence
} from "firebase/auth";
// CORRECTION : Le chemin a été ajusté pour remonter d'un dossier
import { auth } from '../firebase'; 
import './LoginPage.css'; // Assurez-vous que ce fichier est dans le même dossier que LoginPage.jsx

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Veuillez remplir tous les champs.');
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
        <div className="login-container">
            <div className="login-card">
                <div className="header-app-name">
                    <h1>Hermès</h1>
                    <p>Votre application de demande de vacataires</p>
                </div>

                <div className="form-content">
                    <p className="welcome-message">Connectez-vous pour accéder à votre espace de gestion 👇</p>
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
                        {/* CORRECTION : On retire la classe "form-group" pour permettre le centrage */}
                        <div className="remember-me">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="rememberMe">Se souvenir de moi</label>
                        </div>
                        
                        {error && <p className="error-message">{error}</p>}
                        
                        <button type="submit" className="login-btn">Se connecter 🚀</button>
                    </form>
                </div>
            </div>

            <div className="did-you-know-card">
                <h3>Le saviez-vous ? 💡</h3>
                <p>
                    Hermès est le Dieu des messagers, des communications, du commerce et des voyageurs.
                    Notre application agit comme un messager entre les bureaux d'examen et les surveillants.
                    Hermès est le dieu des échanges et de la rapidité, ce qui reflète parfaitement la fonction de notre plateforme à mettre rapidement en relation les parties.
                </p>
            </div>
        </div>
    );
}

export default LoginPage;

