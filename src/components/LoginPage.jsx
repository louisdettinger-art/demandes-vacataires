import React, { useState } from 'react';

function LoginPage({ onLogin }) {
    const [bureau, setBureau] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        
        if (!bureau || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        const bureauNumber = bureau.replace('DEC', '');
        const expectedPassword = `vdec${bureauNumber}`;

        if (password === expectedPassword) {
            onLogin(bureau);
        } else {
            alert('Mot de passe incorrect. Utilisez : ' + expectedPassword);
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
                    <label htmlFor="bureau">Bureau organisateur</label>
                    <select 
                        id="bureau" 
                        value={bureau} 
                        onChange={(e) => setBureau(e.target.value)} 
                        required
                    >
                        <option value="">Sélectionnez votre bureau</option>
                        <option value="DEC1">DEC1</option>
                        <option value="DEC2">DEC2</option>
                        <option value="DEC3">DEC3</option>
                        <option value="DEC4">DEC4</option>
                        <option value="DEC5">DEC5</option>
                        <option value="DEC6">DEC6</option>
                        <option value="DEC7">DEC7</option>
                        <option value="DEC8">DEC8</option>
                        <option value="DEC9">DEC9</option>
                        <option value="DEC10">DEC10</option>
                    </select>
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

                <button type="submit" className="login-btn">Se connecter</button>
            </form>
        </div>
    );
}

export default LoginPage;