import React from 'react';

function DemandeStatus({ statut, onUpdateStatus }) {
    return (
        <div className="demande-status-control">
            <p>Statut actuel : <span className={`status ${statut.toLowerCase().replace(' ', '-')}`}>{statut}</span></p>
            <div className="status-buttons">
                <button 
                    onClick={() => onUpdateStatus('En attente')} 
                    className={`status-btn en-attente ${statut === 'En attente' ? 'active' : ''}`}
                >
                    En attente
                </button>
                <button 
                    onClick={() => onUpdateStatus('En cours')} 
                    className={`status-btn en-cours ${statut === 'En cours' ? 'active' : ''}`}
                >
                    En cours
                </button>
                <button 
                    onClick={() => onUpdateStatus('Terminée')} 
                    className={`status-btn terminee ${statut === 'Terminée' ? 'active' : ''}`}
                >
                    Terminée
                </button>
            </div>
        </div>
    );
}

export default DemandeStatus;