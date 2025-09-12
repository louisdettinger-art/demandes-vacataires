import React from 'react';

function RequestCard({ demande, onClick, priorityClass, onCreateFrom }) {
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

    const getStatusClass = (statut) => {
        switch (statut) {
            case 'En cours': return 'status-inprogress';
            case 'Terminée': return 'status-completed';
            case 'Annulée': return 'status-cancelled';
            case 'En attente': default: return 'status-pending';
        }
    };

    const handleCreateFromClick = (e) => {
        e.stopPropagation(); 
        onCreateFrom(demande);
    };

    return (
        <div className={`request-card ${priorityClass}`} onClick={onClick}>
            <div className="request-header">
                {/* On crée un conteneur pour le titre et le bouton */}
                <div className="header-main-content">
                    <h4>{demande.titreComplet || 'Titre non spécifié'}</h4>
                    <span className={`status ${getStatusClass(demande.statut)}`}>{demande.statut}</span>
                </div>
                {/* Le bouton est maintenant ici, à droite */}
                <div className="card-actions">
                    <button className="create-from-btn" onClick={handleCreateFromClick}>
                        Créer à partir de
                    </button>
                </div>
            </div>
            <div className="request-body">
                <p><strong>Bureau:</strong> {demande.bureau || 'N/A'}</p>
                <p><strong>Échéance:</strong> {firstDate ? firstDate.toLocaleDateString('fr-FR') : 'N/A'}</p>
                <p><strong>Intervenants:</strong> {totalIntervenants} ({intervenantsText})</p>
                <p><strong>Ville:</strong> {demande.ville || 'N/A'}</p>
                <p><strong>Lieu:</strong> {demande.libelleCentre || 'N/A'} ({demande.codeCentre || 'N/A'})</p>
                <p><strong>Gestionnaire:</strong> {demande.gestionnaire || 'N/A'}</p>
            </div>
        </div>
    );
}

export default RequestCard;