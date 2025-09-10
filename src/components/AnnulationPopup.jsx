import React, { useState } from 'react';

function AnnulationPopup({ onCancel, onClose, currentUser }) {
    const [motif, setMotif] = useState('');
    const [gestionnaire, setGestionnaire] = useState(currentUser || '');

    const handleConfirm = () => {
        if (!motif || !gestionnaire) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        onCancel(motif, gestionnaire);
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h2>Motif d'annulation</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="form-group">
                    <label htmlFor="motif">Motif d'annulation</label>
                    <textarea 
                        id="motif" 
                        rows="4" 
                        value={motif} 
                        onChange={(e) => setMotif(e.target.value)} 
                        placeholder="Veuillez décrire la raison de l'annulation"
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="gestionnaire">Votre nom et prénom</label>
                    <input 
                        type="text" 
                        id="gestionnaire" 
                        value={gestionnaire} 
                        onChange={(e) => setGestionnaire(e.target.value)} 
                    />
                </div>
                <button className="submit-btn" onClick={handleConfirm}>Confirmer l'annulation</button>
            </div>
        </div>
    );
}

export default AnnulationPopup;