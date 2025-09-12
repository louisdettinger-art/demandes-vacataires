import React, { useState, useEffect } from 'react';
import DemandeStatus from './DemandeStatus';
import AnnulationPopup from './AnnulationPopup';
import { FaInfoCircle, FaMapMarkerAlt, FaUsers, FaClipboardList, FaUserCheck, FaFileAlt, FaEdit, FaSave, FaFilePdf, FaTrashAlt } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';

function RequestDetailsPopup({ demande, onClose, onUpdateStatus, isDEC1, currentUser, onDelete }) {
    if (!demande) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [editedDemande, setEditedDemande] = useState(demande);
    const [intervenantsRecrutes, setIntervenantsRecrutes] = useState([]);
    const [numeroMission, setNumeroMission] = useState('');
    const [statut, setStatut] = useState('');
    const [gestionnaireDEC1, setGestionnaireDEC1] = useState('');
    const [isAnnulationPopupOpen, setIsAnnulationPopupOpen] = useState(false);

    useEffect(() => {
        if (demande) {
            setEditedDemande(demande);
            setIntervenantsRecrutes(demande.intervenantsRecrutes || []);
            setNumeroMission(demande.numeroMission || '');
            setStatut(demande.statut || 'En attente');
            setGestionnaireDEC1(demande.gestionnaireDEC1 || '');
        }
    }, [demande]);
    
    // Fonction de génération de PDF, placée ici pour être bien définie
    const generatePDF = () => {
        const doc = new jsPDF();
        let y = 15;
        doc.setFontSize(18);
        doc.text(`Récapitulatif : Demande N°${demande.referenceNumber}`, 105, y, { align: 'center' });
        y += 10;
        doc.line(14, y, 196, y);
        y += 12;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("Informations Générales", 14, y);
        y += 7;
        doc.setFont(undefined, 'normal');
        doc.text(`- Bureau Organisateur: ${demande.bureau}`, 16, y); y += 7;
        doc.text(`- Domaine: ${demande.domaine}`, 16, y); y += 7;
        doc.text(`- Gestionnaire: ${demande.gestionnaire}`, 16, y); y += 7;
        if (demande.numeroMission) { doc.text(`- N° de Mission: ${demande.numeroMission}`, 16, y); y += 7; }
        if (demande.gestionnaireDEC1) { doc.text(`- Gestionnaire DEC1: ${demande.gestionnaireDEC1}`, 16, y); y += 7; }
        y += 5;

        doc.setFont(undefined, 'bold');
        doc.text("Lieu de l'épreuve", 14, y);
        y += 7;
        doc.setFont(undefined, 'normal');
        doc.text(`- Centre: ${demande.libelleCentre} (${demande.codeCentre})`, 16, y); y += 7;
        doc.text(`- Ville: ${demande.ville} (${demande.codePostal || 'N/A'})`, 16, y); y += 12;

        doc.setFontSize(14);
        doc.text("Détail des interventions", 14, y);
        y += 8;
        
        let recruitedIndex = 0;
        demande.intervenants?.forEach(intervenant => {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`Groupe : ${intervenant.nombre} x ${intervenant.type}`, 16, y);
            y += 7;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(11);
            for (let i = 0; i < intervenant.nombre; i++) {
                const nomRecrute = (intervenantsRecrutes || [])[recruitedIndex] || "(Poste non pourvu)";
                doc.text(`  • Intervenant recruté : ${nomRecrute}`, 18, y);
                y += 6;
                recruitedIndex++;
            }
            doc.setFont(undefined, 'italic');
            intervenant.dates?.forEach(dateInfo => {
                const dateStr = new Date(dateInfo.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                let scheduleText = `    Horaires : Le ${dateStr} de ${dateInfo.heureDebut} à ${dateInfo.heureFin}`;
                if (dateInfo.pauseMeridienne) { scheduleText += " (avec pause méridienne)"; }
                doc.text(scheduleText, 20, y);
                y += 6;
            });
            y += 4;
        });
        
        y = 265; 
        doc.setFontSize(11);
        doc.setFont(undefined, 'italic');
        doc.text("La Direction des Examens et Concours vous remercie de votre collaboration", 105, y, { align: 'center' });
        y += 6;
        doc.text("et vous souhaite d'excellentes conditions d'examen.", 105, y, { align: 'center' });
        doc.save(`recap_demande_${demande.referenceNumber}.pdf`);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedDemande(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdits = async () => {
        const demandeDocRef = doc(db, "demandes", demande.id);
        try {
            const { domaine, specialite, epreuve, gestionnaire, codeCentre, libelleCentre, ville, codePostal, observations, intervenants } = editedDemande;
            await updateDoc(demandeDocRef, { domaine, specialite, epreuve, gestionnaire, codeCentre, libelleCentre, ville, codePostal, observations, intervenants });
            alert("Modifications enregistrées !");
            setIsEditing(false);
        } catch (error) {
            console.error("Erreur:", error);
            alert("La sauvegarde a échoué.");
        }
    };
    
    const handleIntervenantEditChange = (e, index) => {
        const { name, value } = e.target;
        const newIntervenants = [...editedDemande.intervenants];
        newIntervenants[index] = { ...newIntervenants[index], [name]: value };
        setEditedDemande(prev => ({ ...prev, intervenants: newIntervenants }));
    };

    const handleDateEditChange = (e, intervenantIndex, dateIndex) => {
        const { name, value, type, checked } = e.target;
        const newIntervenants = [...editedDemande.intervenants];
        const newDates = [...newIntervenants[intervenantIndex].dates];
        newDates[dateIndex] = { ...newDates[dateIndex], [name]: type === 'checkbox' ? checked : value };
        newIntervenants[intervenantIndex].dates = newDates;
        setEditedDemande(prev => ({ ...prev, intervenants: newIntervenants }));
    };

    const addIntervenant = () => {
        setEditedDemande(prev => ({
            ...prev,
            intervenants: [...(prev.intervenants || []), { type: '', nombre: 1, dates: [{ date: '', heureDebut: '', heureFin: '', pauseMeridienne: false }] }]
        }));
    };

    const removeIntervenant = (index) => {
        const newIntervenants = [...editedDemande.intervenants];
        newIntervenants.splice(index, 1);
        setEditedDemande(prev => ({ ...prev, intervenants: newIntervenants }));
    };

    const addDate = (intervenantIndex) => {
        const newIntervenants = [...editedDemande.intervenants];
        newIntervenants[intervenantIndex].dates.push({ date: '', heureDebut: '', heureFin: '', pauseMeridienne: false });
        setEditedDemande(prev => ({ ...prev, intervenants: newIntervenants }));
    };

    const removeDate = (intervenantIndex, dateIndex) => {
        const newIntervenants = [...editedDemande.intervenants];
        newIntervenants[intervenantIndex].dates.splice(dateIndex, 1);
        setEditedDemande(prev => ({ ...prev, intervenants: newIntervenants }));
    };

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
        onUpdateStatus(demande.id, 'Annulée', { intervenantsRecrutes: [], numeroMission: '', gestionnaireDEC1: gestionnaireAnnulation, motifAnnulation: motif });
        setIsAnnulationPopupOpen(false);
        onClose();
    };
    
    const handleSaveChanges = () => {
        onUpdateStatus(demande.id, statut, { intervenantsRecrutes, numeroMission, gestionnaireDEC1 });
        onClose();
    };

    const getIntervenantsAndDatesList = () => {
        return demande.intervenants?.map((intervenant, index) => (
            <div key={index} className="intervenant-group-details">
                <div className="intervenant-item">
                    <span>{`Groupe ${index + 1}: ${intervenant.type}`}</span>
                    <strong>{intervenant.nombre}</strong>
                </div>
                <div className="dates-section">
                    {intervenant.dates?.map((dateInfo, i) => (
                        <div key={i} className="date-item">
                            <div>{new Date(dateInfo.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
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

    const renderIntervenantInputs = () => {
        let globalIntervenantIndex = 0;
        return demande.intervenants?.map((group, groupIndex) => {
            const groupInputs = [];
            for (let i = 0; i < group.nombre; i++) {
                const currentIndexInState = globalIntervenantIndex++;
                const localIndexInGroup = i + 1;
                groupInputs.push(
                    <div key={currentIndexInState} className="form-group intervenant-recrute">
                        <label>{`Nom de l'intervenant ${localIndexInGroup}`}</label>
                        <input type="text" placeholder="Nom et Prénom" value={intervenantsRecrutes[currentIndexInState] || ''} onChange={(e) => handleIntervenantRecruteChange(currentIndexInState, e.target.value)} />
                    </div>
                );
            }
            return (
                <div key={groupIndex} className="recruitment-group">
                    <h4>{`Groupe : ${group.type}`}</h4>
                    {groupInputs}
                </div>
            );
        });
    };

    const renderEditableIntervenants = () => (
        <>
            {editedDemande.intervenants?.map((intervenant, intervenantIndex) => (
                <div className="intervenant-group" key={intervenantIndex}>
                    <div className="intervenant-row">
                        <div className="form-group">
                            <label>Type</label>
                            <select name="type" value={intervenant.type} onChange={(e) => handleIntervenantEditChange(e, intervenantIndex)} required>
                                <option value="">Sélectionner</option>
                                <option value="Surveillant">Surveillant</option>
                                <option value="Surveillant + mise en loge">Surveillant + mise en loge</option>
                                <option value="Secrétaire scripteur">Secrétaire scripteur</option>
                                <option value="Secrétaire lecteur">Secrétaire lecteur</option>
                                <option value="Responsable de bloc">Responsable de bloc</option>
                                <option value="Responsable de salle">Responsable de salle</option>
                                <option value="Travaux publics">Travaux publics</option>
                                <option value="Adjoint au chef de centre">Adjoint au chef de centre</option>
                                <option value="Chef de centre">Chef de centre</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nombre</label>
                            <input type="number" name="nombre" min="1" value={intervenant.nombre} onChange={(e) => handleIntervenantEditChange(e, intervenantIndex)} required />
                        </div>
                        <button type="button" className="remove-btn" onClick={() => removeIntervenant(intervenantIndex)}>X</button>
                    </div>
                    {intervenant.dates.map((date, dateIndex) => (
                        <div className="date-row" key={dateIndex}>
                            <input type="date" name="date" value={date.date} onChange={(e) => handleDateEditChange(e, intervenantIndex, dateIndex)} required />
                            <input type="time" name="heureDebut" value={date.heureDebut} onChange={(e) => handleDateEditChange(e, intervenantIndex, dateIndex)} required />
                            <input type="time" name="heureFin" value={date.heureFin} onChange={(e) => handleDateEditChange(e, intervenantIndex, dateIndex)} required />
                            <button type="button" className="remove-btn" onClick={() => removeDate(intervenantIndex, dateIndex)}>X</button>
                        </div>
                    ))}
                    <button type="button" className="add-date-btn" onClick={() => addDate(intervenantIndex)}>+ Ajouter date</button>
                </div>
            ))}
            <button type="button" className="add-btn" onClick={addIntervenant}>+ Ajouter un groupe d'intervenants</button>
        </>
    );

    const renderRecruitedDisplay = () => {
        const recruited = intervenantsRecrutes.filter(name => name && name.trim() !== '');
        if (recruited.length === 0) {
            return <p>Aucun intervenant recruté pour le moment.</p>;
        }
        return (
            <ul className="recruited-list">
                {recruited.map((name, index) => (
                    <li key={index}>{name}</li>
                ))}
            </ul>
        );
    };

    const isMissionAnnulee = statut === 'Annulée';

    return (
        <>
            <div className="popup-overlay request-details-popup" onClick={onClose}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                    <div className="popup-header">
                        <h2>Détails de la demande</h2>
                        <div className="header-actions">
                            {demande.statut === 'Terminée' && (
                                <button className="pdf-btn" onClick={generatePDF}><FaFilePdf /> Récap PDF</button>
                            )}
                            {isDEC1 && !isMissionAnnulee && (
                                <div className="edit-actions">
                                    {isEditing ? (
                                        <>
                                            <button className="save-changes-btn" onClick={handleSaveEdits}><FaSave /> Enregistrer</button>
                                            <button className="annuler-btn" onClick={() => { setIsEditing(false); setEditedDemande(demande); }}>Annuler</button>
                                        </>
                                    ) : (
                                        <button className="edit-btn" onClick={() => setIsEditing(true)}><FaEdit /> Modifier la demande</button>
                                    )}
                                </div>
                            )}
                            <button className="close-btn" onClick={onClose}>&times;</button>
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <div className="detail-section">
                                <h3><FaInfoCircle /> Informations Générales</h3>
                                <div className="detail-item"><strong>N° Référence:</strong> <span>{demande.referenceNumber || '-'}</span></div>
                                <div className="detail-item"><strong>Bureau:</strong> <span>{demande.bureau || '-'}</span></div>
                                <div className="detail-item"><strong>Domaine:</strong> {isEditing ? <input name="domaine" value={editedDemande.domaine} onChange={handleEditChange} /> : <span>{demande.domaine || '-'}</span>}</div>
                                <div className="detail-item"><strong>Spécialité:</strong> {isEditing ? <input name="specialite" value={editedDemande.specialite} onChange={handleEditChange} /> : <span>{demande.specialite || '-'}</span>}</div>
                                <div className="detail-item"><strong>Épreuve:</strong> {isEditing ? <input name="epreuve" value={editedDemande.epreuve} onChange={handleEditChange} /> : <span>{demande.epreuve || '-'}</span>}</div>
                                <div className="detail-item"><strong>Gestionnaire:</strong> {isEditing ? <input name="gestionnaire" value={editedDemande.gestionnaire} onChange={handleEditChange} /> : <span>{demande.gestionnaire || '-'}</span>}</div>
                                <div className="detail-item"><strong>N° Mission:</strong> <span>{demande.numeroMission || 'Non défini'}</span></div>
                                <div className="detail-item"><strong>Gestionnaire DEC1:</strong> <span>{demande.gestionnaireDEC1 || 'Non défini'}</span></div>
                            </div>
                            <div className="detail-section">
                                <h3><FaMapMarkerAlt /> Lieu de l'examen</h3>
                                <div className="detail-item"><strong>Code centre:</strong> {isEditing ? <input name="codeCentre" value={editedDemande.codeCentre} onChange={handleEditChange} /> : <span>{demande.codeCentre || '-'}</span>}</div>
                                <div className="detail-item"><strong>Libellé centre:</strong> {isEditing ? <input name="libelleCentre" value={editedDemande.libelleCentre} onChange={handleEditChange} /> : <span>{demande.libelleCentre || '-'}</span>}</div>
                                <div className="detail-item"><strong>Ville:</strong> {isEditing ? <input name="ville" value={editedDemande.ville} onChange={handleEditChange} /> : <span>{demande.ville || '-'}</span>}</div>
                                <div className="detail-item"><strong>Code Postal:</strong> {isEditing ? <input name="codePostal" value={editedDemande.codePostal} onChange={handleEditChange} /> : <span>{demande.codePostal || '-'}</span>}</div>
                            </div>
                            <div className="detail-section">
                                <h3><FaFileAlt /> Observations</h3>
                                {isEditing ? <textarea name="observations" value={editedDemande.observations} onChange={handleEditChange} rows="4" style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} /> : <p>{demande.observations || 'Aucune observation'}</p>}
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
                                <h3><FaUsers /> Intervenants Requis</h3>
                                {isEditing ? renderEditableIntervenants() : getIntervenantsAndDatesList()}
                            </div>
                            <div className="detail-section">
                                <h3><FaUserCheck /> Personnes recrutées ({totalIntervenantsRecrutes}/{totalIntervenantsRequis})</h3>
                                {isDEC1 && !isEditing ? renderIntervenantInputs() : renderRecruitedDisplay()}
                            </div>
                            {isDEC1 && (
                                <div className="detail-section">
                                    <h3><FaClipboardList /> Gestion DEC1</h3>
                                    <div className="form-group">
                                        <label>N° de mission</label>
                                        <input type="text" value={numeroMission} onChange={handleNumeroMissionChange} disabled={isMissionAnnulee || isEditing} />
                                    </div>
                                    <div className="form-group">
                                        <label>Gestionnaire DEC1</label>
                                        <input type="text" value={gestionnaireDEC1} onChange={handleGestionnaireDEC1Change} disabled={isMissionAnnulee || isEditing} />
                                    </div>
                                    <div className="form-group">
                                        <label>Statut de la demande</label>
                                        <DemandeStatus statut={statut} onUpdateStatus={handleStatutChange} />
                                    </div>
                                    <div className="annulation-actions">
                                        {!isMissionAnnulee ? (
                                            <>
                                                <button onClick={handleSaveChanges} className="save-changes-btn" disabled={isEditing}>Enregistrer Actions DEC1</button>
                                                <button onClick={handleAnnulerClick} className="annuler-btn" disabled={isEditing}>Annuler la demande</button>
                                                <button onClick={() => onDelete(demande.id)} className="delete-btn" disabled={isEditing}>Supprimer</button>
                                            </>
                                        ) : (
                                            <button onClick={() => onUpdateStatus(demande.id, 'En attente', { motifAnnulation: '' })} className="reactiver-btn">Réactiver la demande</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isAnnulationPopupOpen && <AnnulationPopup onCancel={handleAnnulationConfirm} onClose={() => setIsAnnulationPopupOpen(false)} currentUser={currentUser} />}
        </>
    );
}

export default RequestDetailsPopup;