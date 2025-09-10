import React, { useState, useEffect } from 'react';
import DemandeStatus from './DemandeStatus';
import AnnulationPopup from './AnnulationPopup';
import { FaInfoCircle, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaFileAlt, FaClipboardList, FaUserCheck } from 'react-icons/fa';

function RequestDetailsPopup({ demande, onClose, onUpdateStatus, isDEC1, currentUser }) {
    if (!demande) return null;

    // États locaux pour gérer les modifications dans le formulaire
    const [intervenantsRecrutes, setIntervenantsRecrutes] = useState([]);
    const [numeroMission, setNumeroMission] = useState('');
    const [statut, setStatut] = useState('');
    const [gestionnaireDEC1, setGestionnaireDEC1] = useState('');
    const [isAnnulationPopupOpen, setIsAnnulationPopupOpen] = useState(false);

    // BUG CORRIGÉ : Ce useEffect synchronise l'état du popup avec les données
    // qui peuvent changer en temps réel (si un autre utilisateur modifie la demande).
    useEffect(() => {
        if (demande) {
            setIntervenantsRecrutes(demande.intervenantsRecrutes || []);
            setNumeroMission(demande.numeroMission || '');
            setStatut(demande.statut || 'En attente');
            setGestionnaireDEC1(demande.gestionnaireDEC1 || '');
        }
    }, [demande]);


    const totalIntervenantsRequis = demande.intervenants?.reduce((total, int) => total + (parseInt(int.nombre, 10) || 0), 0) ?? 0;
    const totalIntervenantsRecrutes = intervenantsRecrutes.filter(name => name && name.trim() !== '').length;

    const handleIntervenantRecruteChange = (index, value) => {
        const newIntervenantsRecrutes = [...intervenantsRecrutes];
        newIntervenantsRecrutes[index] = value;
        setIntervenantsRecrutes(newIntervenantsRecrutes);
    };

    const handleNumeroMissionChange = (e) => setNumeroMission(e.target.value);
    const handleGestionnaireDEC1Change = (e) => setGestionnaireDEC1(e.target.value);
    const handleStatutChange = (newStatut) => setStatut(newStatut);
    const handleAnnulerClick = () => setIsAnnulationPopupOpen(true);

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
            return <div key={groupIndex}>{inputs}</div>;
        });
    };

    const isMissionAnnulee = statut === 'Annulée';

    return (
        <>
            {/* On ajoute la classe "request-details-popup" pour appliquer les bons styles */}
            <div className="popup-overlay request-details-popup" onClick={onClose}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                    <div className="popup-header">
                        <h2>Détails de la demande</h2>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>
                    
                    {/* NOUVELLE STRUCTURE VISUELLE */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                        
                        {/* COLONNE DE GAUCHE */}
                        <div>
                            <div className="detail-section">
                                <h3><FaInfoCircle /> Informations Générales</h3>
                                <div className="detail-grid">
                                    <div className="detail-item"><strong>N° Référence :</strong> <span>{demande.referenceNumber || '-'}</span></div>
                                    <div className="detail-item"><strong>Bureau :</strong> <span>{demande.bureau || '-'}</span></div>
                                    <div className="detail-item"><strong>Domaine :</strong> <span>{demande.domaine || '-'}</span></div>
                                    <div className="detail-item"><strong>Spécialité :</strong> <span>{demande.specialite || '-'}</span></div>
                                    <div className="detail-item"><strong>Épreuve :</strong> <span>{demande.epreuve || '-'}</span></div>
                                    <div className="detail-item"><strong>Gestionnaire :</strong> <span>{demande.gestionnaire || '-'}</span></div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3><FaMapMarkerAlt /> Lieu de l'examen</h3>
                                <div className="detail-grid">
                                    <div className="detail-item"><strong>Code centre :</strong> <span>{demande.codeCentre || '-'}</span></div>
                                    <div className="detail-item"><strong>Libellé centre :</strong> <span>{demande.libelleCentre || '-'}</span></div>
                                    <div className="detail-item"><strong>Ville :</strong> <span>{demande.ville || '-'}</span></div>
                                </div>
                            </div>
                            
                            <div className="detail-section">
                                <h3><FaFileAlt /> Observations</h3>
                                <p>{demande.observations || 'Aucune observation'}</p>
                            </div>

                            {isMissionAnnulee && demande.motifAnnulation && (
                                <div className="detail-section">
                                    <h3>Motif d'annulation</h3>
                                    <p>{demande.motifAnnulation}</p>
                                </div>
                            )}
                        </div>

                        {/* COLONNE DE DROITE */}
                        <div>
                            <div className="detail-section intervenant-list-details">
                                <h3><FaUsers /> Intervenants Requis</h3>
                                {demande.intervenants?.map((intervenant, index) => (
                                    <div key={index}>
                                        <ul>
                                            <li>
                                                <strong>{intervenant.type}</strong>
                                                <span>Quantité : {intervenant.nombre}</span>
                                            </li>
                                        </ul>
                                        <div className="date-list-details">
                                            {intervenant.dates?.map((dateInfo, i) => (
                                                <p key={i}>
                                                    Le {new Date(dateInfo.date).toLocaleDateString('fr-FR')} de {dateInfo.heureDebut} à {dateInfo.heureFin}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isDEC1 && !isMissionAnnulee && (
                                <div className="detail-section dec1-actions">
                                    <h4>Actions DEC1</h4>
                                    <div className="form-group">
                                        <label htmlFor="numeroMission">N° de mission</label>
                                        <input id="numeroMission" type="text" value={numeroMission} onChange={handleNumeroMissionChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="gestionnaireDEC1">Gestionnaire DEC1</label>
                                        <input id="gestionnaireDEC1" type="text" value={gestionnaireDEC1} onChange={handleGestionnaireDEC1Change} />
                                    </div>
                                    
                                    <DemandeStatus statut={statut} onUpdateStatus={handleStatutChange} />
                                    
                                    <div className="detail-section">
                                        <h3><FaUserCheck /> Personnes recrutées ({totalIntervenantsRecrutes}/{totalIntervenantsRequis})</h3>
                                        {renderIntervenantInputs()}
                                    </div>

                                    <div className="action-buttons">
                                        <button onClick={handleSaveChanges} className="btn-assign">Enregistrer les modifications</button>
                                        <button onClick={handleAnnulerClick} className="btn-cancel">Annuler la demande</button>
                                    </div>
                                </div>
                            )}

                             {isDEC1 && isMissionAnnulee && (
                                <div className="detail-section dec1-actions">
                                    <h4>Actions DEC1</h4>
                                    <div className="action-buttons">
                                        <button onClick={() => onUpdateStatus(demande.id, 'En attente', { motifAnnulation: '' })} className="btn-assign">Réactiver la demande</button>
                                    </div>
                                </div>
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