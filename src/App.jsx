// src/App.jsx

import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { NotificationProvider } from './contexts/NotificationContext';

import LoginPage from './components/LoginPage';
import ManagementPage from './components/ManagementPage';
import './App.css';

function App() {
    const [currentUserBureau, setCurrentUserBureau] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const bureauName = user.email.split('@')[0].toUpperCase();
                setCurrentUserBureau(bureauName);
            } else {
                setCurrentUserBureau(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        signOut(auth).catch((error) => console.error("Erreur de déconnexion:", error));
    };

    if (loading) {
        return <div>Chargement...</div>;
    }

    return (
        <NotificationProvider>
            {/* La classe change dynamiquement ici, c'est la clé */}
            <div className={currentUserBureau ? "app-wrapper" : "login-wrapper"}>
                {currentUserBureau ? (
                    <ManagementPage currentUser={currentUserBureau} onLogout={handleLogout} />
                ) : (
                    <LoginPage />
                )}
            </div>
        </NotificationProvider>
    );
}

export default App;