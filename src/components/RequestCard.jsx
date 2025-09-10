import React from 'react';

function RequestCard({ demande, onClick }) {
    const totalIntervenants = demande.intervenants
        ? demande.intervenants.reduce((total, int) => total + (parseInt(int.nombre, 10) || 0), 0)
        : 0;
    
    const intervenantsText = demande.intervenants
        ? demande.intervenants.map(int => `${int.nombre} ${int.type}`).join(', ')
        : 'Aucun intervenant';

    const firstDate = (demande.intervenants?.[0]?.dates?.[0]?.date) 
        ? new Date(demande.intervenants[0].dates[0].date).toLocaleDateString('fr-FR')
        : 'Non spécifiée';

    return (
        <div className="request-card" onClick={onClick}>
            <div className="request-header">
                <h4>{demande.titreComplet || 'Titre non spécifié'}</h4>
                <span className="status status-pending">{demande.statut}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                <p><strong>Bureau:</strong> {demande.bureau || 'Non spécifié'}</p>
                <p><strong>Date:</strong> {firstDate}</p>
                <p><strong>Intervenants requis:</strong> {totalIntervenants} ({intervenantsText})</p>
                <p><strong>Ville:</strong> {demande.ville || 'Non spécifié'}</p>
                <p><strong>Lieu:</strong> {demande.libelleCentre || 'Non spécifié'}</p>
                <p><strong>Gestionnaire:</strong> {demande.gestionnaire || 'Non spécifié'}</p>
            </div>
        </div>
    );
}

export default RequestCard;