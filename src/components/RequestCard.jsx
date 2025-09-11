import React from 'react';

function RequestCard({ demande, onClick, priorityClass }) {
    const totalIntervenants = demande.intervenants
        ? demande.intervenants.reduce((total, int) => total + (parseInt(int.nombre, 10) || 0), 0)
        : 0;
    
    const intervenantsText = demande.intervenants
        ? demande.intervenants.map(int => `${int.nombre} ${int.type}`).join(', ')
        : 'Aucun intervenant';

    const getEarliestDate = (demande) => {
        if (!demande.intervenants || demande.intervenants.length === 0) return null;
        const allDates = demande.intervenants.flatMap(intervenant => intervenant.dates.map(d => new Date(d.date)));
        if (allDates.length === 0) return null;
        return new Date(Math.min.apply(null, allDates));
    };

    const firstDate = getEarliestDate(demande);

    // Fonction pour déterminer la classe CSS du statut
    const getStatusClass = (statut) => {
        switch (statut) {
            case 'En cours':
                return 'status-inprogress';
            case 'Terminée':
                return 'status-completed';
            case 'Annulée':
                return 'status-cancelled';
            case 'En attente':
            default:
                return 'status-pending';
        }
    };

    return (
        // On combine la classe de base avec la classe de priorité reçue en prop
        <div className={`request-card ${priorityClass}`} onClick={onClick}>
            <div className="request-header">
                <h4>{demande.titreComplet || 'Titre non spécifié'}</h4>
                <span className={`status ${getStatusClass(demande.statut)}`}>{demande.statut}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                <p><strong>Bureau:</strong> {demande.bureau || 'Non spécifié'}</p>
                <p><strong>Échéance:</strong> {firstDate ? firstDate.toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
                <p><strong>Intervenants:</strong> {totalIntervenants} ({intervenantsText})</p>
                <p><strong>Ville:</strong> {demande.ville || 'Non spécifié'}</p>
                <p><strong>Lieu:</strong> {demande.libelleCentre || 'Non spécifié'}</p>
                <p><strong>Gestionnaire:</strong> {demande.gestionnaire || 'Non spécifié'}</p>
            </div>
        </div>
    );
}

export default RequestCard;