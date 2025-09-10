import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import ManagementPage from './components/ManagementPage';
import './App.css';

function App() {
    const [currentUser, setCurrentUser] = useState(null);

    const handleLogin = (bureau) => {
        setCurrentUser(bureau);
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    return (
        <div className="app">
            {currentUser ? (
                <ManagementPage currentUser={currentUser} onLogout={handleLogout} />
            ) : (
                <LoginPage onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;