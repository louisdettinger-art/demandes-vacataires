import React, { useState } from 'react';
import DemandeStatus from './DemandeStatus';
import AnnulationPopup from './AnnulationPopup';
import { FaInfoCircle, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';

function RequestDetailsPopup({ demande, onClose, onUpdateStatus, isDEC1, currentUser }) {
    if (!demande) return null;

    const [intervenantsRecrutes, setIntervenantsRecrutes] = useState(demande.intervenantsRecrutes || []);
    const [numeroMission, setNumeroMission] = useState(demande.numeroMission || '');
    const [statut, setStatut] = useState(demande.statut || 'En attente');
    const [gestionnaireDEC1, setGestionnaireDEC1] = useState(demande.gestionnaireDEC1 || '');
    const [isAnnulationPopupOpen, setIsAnnulationPopupOpen] = useState(false);

    // CORRECTION : Ajout de '?.' et d'une valeur par défaut `?? 0` pour éviter une erreur si 'demande.intervenants' n'existe pas.
    const totalIntervenantsRequis = demande.intervenants?.reduce((total, int) => total + (parseInt(int.nombre, 10) || 0), 0) ?? 0;
    const totalIntervenantsRecrutes = intervenantsRecrutes.filter(name => name && name.trim() !== '').length;

    const handleIntervenantRecruteChange = (index, value) => {
        const newIntervenantsRecrutes = [...intervenantsRecrutes];
        newIntervenantsRecrutes[index] = value;
        setIntervenantsRecrutes(newIntervenantsRecrutes);
    };

    const handleNumeroMissionChange = (e) => {
        setNumeroMission(e.target.value);
    };

    const handleGestionnaireDEC1Change = (e) => {
        setGestionnaireDEC1(e.target.value);
    };

    const handleStatutChange = (newStatut) => {
        setStatut(newStatut);
    };

    const handleAnnulerClick = () => {
        setIsAnnulationPopupOpen(true);
    };

    const handleAnnulationConfirm = (motif, gestionnaireAnnulation) => {
        onUpdateStatus(demande.id, 'Annulée', {
            intervenantsRecrutes: [],
            numeroMission: '',
            gestionnaireDEC1: gestionnaireAnnulation,
            motifAnnulation: motif
        });
        setIsAnnulationPopupOpen(false);
        onClose();
    };

    const handleSaveChanges = () => {
        onUpdateStatus(demande.id, statut, {
            intervenantsRecrutes,
            numeroMission,
            gestionnaireDEC1
        });
        onClose();
    };

    const renderIntervenantInputs = () => {
        let intervenantIndex = 0;
        // CORRECTION : Ajout de '?.' pour la robustesse.
        return demande.intervenants?.map((group, groupIndex) => {
            const inputs = [];
            for (let i = 0; i < group.nombre; i++) {
                const currentIndex = intervenantIndex++;
                inputs.push(
                    <div key={currentIndex} className="form-group intervenant-recrute">
                        <label>{`Intervenant ${currentIndex + 1} (${group.type})`}</label>
                        <input
                            type="text"
                            placeholder="Nom et Prénom de l'intervenant"
                            value={intervenantsRecrutes[currentIndex] || ''}
                            onChange={(e) => handleIntervenantRecruteChange(currentIndex, e.target.value)}
                        />
                    </div>
                );
            }
            return (
                <div key={groupIndex} className="recruitment-group">
                    <h4>{`Groupe ${groupIndex + 1}: ${group.type}`}</h4>
                    {inputs}
                </div>
            );
        });
    };

    const renderRecruitedDisplay = () => {
        let intervenantIndex = 0;
        // CORRECTION : Ajout de '?.' pour la robustesse.
        return demande.intervenants?.map((group, groupIndex) => {
            const names = [];
            for (let i = 0; i < group.nombre; i++) {
                const currentIndex = intervenantIndex++;
                if (intervenantsRecrutes[currentIndex] && intervenantsRecrutes[currentIndex].trim() !== '') {
                    names.push(
                        <p key={currentIndex}>{intervenantsRecrutes[currentIndex]}</p>
                    );
                }
            }
            if (names.length === 0) {
                return null;
            }
            return (
                <div key={groupIndex} className="recruitment-group-display">
                    <h4>{`Groupe ${groupIndex + 1}: ${group.type}`}</h4>
                    <ul>
                        {names}
                    </ul>
                </div>
            );
        });
    };

    const getIntervenantsAndDatesList = () => {
        // CORRECTION : Ajout de '?.' sur 'demande.intervenants'.
        return demande.intervenants?.map((intervenant, index) => (
            <div key={index}>
                <div className="intervenant-item">
                    <span>{`Groupe ${index + 1}: ${intervenant.type}`}</span>
                    <strong>{intervenant.nombre}</strong>
                </div>
                <div className="dates-section">
                    {/* CORRECTION PRINCIPALE : Ajout de '?.' sur 'intervenant.dates'. */}
                    {intervenant.dates?.map((dateInfo, i) => (
                        <div key={i} className="date-item">
                            <div>
                                {new Date(dateInfo.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="date-time">
                                <span>{dateInfo.heureDebut || '--:--'} → {dateInfo.heureFin || '--:--'}</span>
                                {dateInfo.pauseMeridienne && <div className="pause-indicator">Pause méridienne</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    const isMissionAnnulee = statut === 'Annulée';

    return (
        <>
            <div className="popup-overlay" onClick={onClose}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                    <div className="popup-header">
                        <h2>Détails de la demande</h2>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        <div>
                            <div className="detail-section">
                                <h3>📋 Informations générales</h3>
                                <div className="detail-item"><label>Numéro de référence :</label><span>{demande.referenceNumber || '-'}</span></div>
                                <div className="detail-item"><label>Bureau organisateur :</label><span>{demande.bureau || '-'}</span></div>
                                <div className="detail-item"><label>Domaine :</label><span>{demande.domaine || '-'}</span></div>
                                <div className="detail-item"><label>Spécialité :</label><span>{demande.specialite || '-'}</span></div>
                                <div className="detail-item"><label>Épreuve :</label><span>{demande.epreuve || '-'}</span></div>
                                <div className="detail-item"><label>Gestionnaire :</label><span>{demande.gestionnaire || '-'}</span></div>
                            </div>
                            <div className="detail-section">
                                <h3>📍 Lieu de l'examen</h3>
                                <div className="detail-item"><label>Code centre :</label><span>{demande.codeCentre || '-'}</span></div>
                                <div className="detail-item"><label>Libellé centre :</label><span>{demande.libelleCentre || '-'}</span></div>
                                <div className="detail-item"><label>Ville :</label><span>{demande.ville || '-'}</span></div>
                            </div>
                            <div className="detail-section">
                                <h3>📝 Observations</h3>
                                <div id="detail-observations" style={{ background: 'white', padding: '20px', borderRadius: '8px', minHeight: '100px', border: '1px solid #e9ecef', fontSize: '16px', lineHeight: '1.6' }}>
                                    {demande.observations || 'Aucune observation'}
                                </div>
                            </div>
                            {isMissionAnnulee && demande.motifAnnulation && (
                                <div className="detail-section">
                                    <h3>Motif d'annulation</h3>
                                    <p>{demande.motifAnnulation}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="detail-section">
                                <h3>👥 Intervenants requis</h3>
                                <div id="detail-intervenants">{getIntervenantsAndDatesList()}</div>
                            </div>
                            <div className="detail-section">
                                <h3>N° de mission</h3>
                                <div className="form-group">
                                    {isDEC1 ? (
                                        <input
                                            type="text"
                                            placeholder="Numéro de mission"
                                            value={numeroMission}
                                            onChange={handleNumeroMissionChange}
                                            disabled={isMissionAnnulee}
                                        />
                                    ) : (
                                        <p>{demande.numeroMission || 'Non spécifié'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="detail-section">
                                <h3>Personnes recrutées ({totalIntervenantsRecrutes}/{totalIntervenantsRequis})</h3>
                                <div className="intervenants-recrutes-container">
                                    {isDEC1 ? renderIntervenantInputs() : renderRecruitedDisplay()}
                                </div>
                            </div>
                            {isDEC1 && (
                                <>
                                    <div className="detail-section">
                                        <div className="form-group">
                                            <label htmlFor="gestionnaireDEC1">Gestionnaire DEC1 :</label>
                                            <input
                                                id="gestionnaireDEC1"
                                                type="text"
                                                placeholder="Nom du gestionnaire DEC1"
                                                value={gestionnaireDEC1}
                                                onChange={handleGestionnaireDEC1Change}
                                                disabled={isMissionAnnulee}
                                            />
                                        </div>
                                    </div>
                                    <div className="detail-section">
                                        <DemandeStatus statut={statut} onUpdateStatus={handleStatutChange} />
                                    </div>
                                    <div className="detail-section" style={{textAlign: 'center'}}>
                                        {isMissionAnnulee ? (
                                            <div className="annulation-actions">
                                                <button onClick={() => setStatut(demande.statut === 'Annulée' ? 'En attente' : demande.statut)} className="reactiver-btn">Réactiver la demande</button>
                                            </div>
                                        ) : (
                                            <div className="annulation-actions">
                                                <button onClick={handleSaveChanges} className="save-changes-btn">Enregistrer les modifications</button>
                                                <button onClick={handleAnnulerClick} className="annuler-btn">Annuler la demande</button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isAnnulationPopupOpen && (
                <AnnulationPopup 
                    onCancel={handleAnnulationConfirm} 
                    onClose={() => setIsAnnulationPopupOpen(false)} 
                    currentUser={currentUser} 
                />
            )}
        </>
    );
}

export default RequestDetailsPopup;