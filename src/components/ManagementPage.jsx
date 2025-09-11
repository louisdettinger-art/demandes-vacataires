import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"; 
import { updatePassword } from "firebase/auth";
import { useNotifications } from '../contexts/NotificationContext';
import ConfirmationPopup from './ConfirmationPopup'; 
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';
import NewRequestPopup from './NewRequestPopup';
import RequestCard from './RequestCard';
import RequestDetailsPopup from './RequestDetailsPopup';
import AnnulationPopup from './AnnulationPopup';
import SearchPopup from './SearchPopup';
import PasswordChangePopup from './PasswordChangePopup';
import AlertPopup from './AlertPopup';

const getEarliestDate = (demande) => {
    if (!demande.intervenants || demande.intervenants.length === 0) return null;
    const allDates = demande.intervenants.flatMap(intervenant => intervenant.dates.map(d => new Date(d.date)));
    if (allDates.length === 0) return null;
    return new Date(Math.min.apply(null, allDates));
};

const getPriorityClass = (echeance) => {
    if (!echeance) return ''; 
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const threeWeeks = 21 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const diff = echeance.getTime() - now.getTime();
    if (diff <= 0) return 'priority-high';
    if (diff < oneWeek) return 'priority-high';
    if (diff < threeWeeks) return 'priority-medium';
    if (diff > oneMonth) return 'priority-low';
    return '';
};

function ManagementPage({ currentUser, onLogout }) {
    const [demandes, setDemandes] = useState([]);
    const demandesRef = useRef([]);
    const { addNotification, markAsRead } = useNotifications();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
    const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('attente');
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [searchCriteres, setSearchCriteres] = useState({});
    const isDEC1 = currentUser === 'DEC1';
    const [sortKey, setSortKey] = useState('echeance');
    const [sortDirection, setSortDirection] = useState('asc');
    const [alertInfo, setAlertInfo] = useState({ show: false, title: '', message: '' });
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, demandeId: null });

    useEffect(() => {
        const q = collection(db, "demandes");
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.docChanges().forEach((change) => {
                if (change.type === "modified") {
                    const oldData = demandesRef.current.find(d => d.id === change.doc.id);
                    const newData = { id: change.doc.id, ...change.doc.data() };
                    if (oldData && oldData.statut !== newData.statut) {
                        const message = `La demande ${newData.referenceNumber} est passée à "${newData.statut}"`;
                        addNotification(message, newData.id);
                    }
                }
            });
            const fullDemandesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDemandes(fullDemandesList);
            demandesRef.current = fullDemandesList;
        });
        return () => unsubscribe();
    }, []);

    const handleDeleteRequest = async () => {
        const { demandeId } = deleteConfirmation;
        if (!demandeId) return;
        const demandeDocRef = doc(db, "demandes", demandeId);
        try {
            await deleteDoc(demandeDocRef);
            alert("La demande a été supprimée avec succès.");
            setSelectedDemande(null);
            setDeleteConfirmation({ show: false, demandeId: null });
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            alert("La suppression a échoué.");
        }
    };

    const triggerDeleteConfirmation = (demandeId) => {
        setDeleteConfirmation({ show: true, demandeId });
    };
    const handleBellClick = () => { setIsPanelOpen(prev => !prev); markAsRead(); };
    const handleNotificationClick = (demandeId) => {
        const demandeToOpen = demandes.find(d => d.id === demandeId);
        if (demandeToOpen) { setSelectedDemande(demandeToOpen); setIsPanelOpen(false); }
    };
    const handleChangePassword = async (newPassword) => {
        if (!auth.currentUser) { return; }
        try {
            await updatePassword(auth.currentUser, newPassword);
            alert("Mot de passe modifié avec succès !");
            setIsPasswordPopupOpen(false);
        } catch (error) {
            console.error("Erreur:", error);
            alert("Une erreur est survenue.");
        }
    };
    const handleOpenPopup = () => setIsPopupOpen(true);
    const handleClosePopup = () => setIsPopupOpen(false);
    const handleOpenSearchPopup = () => setIsSearchPopupOpen(true);
    const handleCloseSearchPopup = () => setIsSearchPopupOpen(false);
    const handleSearch = (criteres) => { setSearchCriteres(criteres); setActiveTab('toutes'); handleCloseSearchPopup(); };
    const handleNewDemandeSubmit = async (newDemande) => {
        try {
            const referenceNumber = Math.floor(100000 + Math.random() * 900000);
            const finalDemande = { referenceNumber: `DEM-${referenceNumber}`, bureau: currentUser, titreComplet: `${newDemande.domaine}${newDemande.specialite ? ` - ${newDemande.specialite}` : ''}${newDemande.epreuve ? ` (${newDemande.epreuve})` : ''}`, statut: 'En attente', dateCreation: new Date().toISOString(), ...newDemande, intervenantsRecrutes: [], numeroMission: '', gestionnaireDEC1: '' };
            await addDoc(collection(db, "demandes"), finalDemande);
            handleClosePopup();
            const echeance = getEarliestDate(newDemande);
            if (echeance) {
                const now = new Date();
                const oneWeek = 7 * 24 * 60 * 60 * 1000;
                const diff = echeance.getTime() - now.getTime();
                if (diff >= 0 && diff < oneWeek) {
                    setAlertInfo({
                        show: true,
                        title: "‼️ AVERTISSEMENT : DÉLAI COURT ‼️",
                        message: "Le délai pour cette demande est inférieur à une semaine.\n\nVeuillez contacter de toute urgence le bureau des vacataires pour les informer qu'une demande hors délai doit être traitée en priorité."
                    });
                }
            }
        } catch (error) { 
            console.error("Erreur : ", error); 
            alert("Une erreur est survenue."); 
        }
    };
    const handleCardClick = (demande) => setSelectedDemande(demande);
    const handleCloseDetailsPopup = () => setSelectedDemande(null);
    const handleUpdateStatus = async (id, newStatus, updatedData) => {
        const demandeDocRef = doc(db, "demandes", id);
        try {
            await updateDoc(demandeDocRef, { statut: newStatus, ...updatedData });
        } catch (error) { console.error("Erreur : ", error); alert("La mise à jour a échoué."); }
    };
    const handleSort = (key) => { 
        if (sortKey === key) { 
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); 
        } else { 
            setSortKey(key); 
            setSortDirection('asc'); 
        } 
    };
    const filteredAndSortedDemandes = useMemo(() => {
        let filtered = isDEC1 ? demandes : demandes.filter(d => d.bureau === currentUser);
        const criteres = Object.entries(searchCriteres).filter(([, value]) => value && String(value).trim() !== '');
        if (criteres.length > 0) {
            filtered = filtered.filter(demande => {
                return criteres.every(([key, value]) => {
                    const lowerValue = String(value).toLowerCase();
                    if (key === 'nomIntervenant') { return demande.intervenantsRecrutes?.some(name => name.toLowerCase().includes(lowerValue)); }
                    if (key === 'date') { return demande.intervenants?.flatMap(int => int.dates?.map(d => d.date)).includes(value); }
                    const demandeValue = String(demande[key] || '').toLowerCase();
                    return demandeValue.includes(lowerValue);
                });
            });
        }
        if (activeTab !== 'toutes') {
            const statutMap = { attente: 'En attente', cours: 'En cours', terminees: 'Terminée', annulees: 'Annulée' };
            filtered = filtered.filter(d => d.statut === statutMap[activeTab]);
        }
        const processedDemandes = filtered.map(demande => ({
            ...demande,
            echeance: getEarliestDate(demande)
        }));
        return processedDemandes.sort((a, b) => {
            let aValue, bValue;
            if (sortKey === 'echeance') {
                if (!a.echeance) return 1;
                if (!b.echeance) return -1;
                aValue = a.echeance.getTime();
                bValue = b.echeance.getTime();
            } else {
                aValue = a[sortKey];
                bValue = b[sortKey];
                if (sortKey === 'dateCreation') {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
                }
            }
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [demandes, activeTab, searchCriteres, currentUser, isDEC1, sortKey, sortDirection]);
    const tabCounts = useMemo(() => {
        const userRequests = isDEC1 ? demandes : demandes.filter(d => d.bureau === currentUser);
        return { 
            attente: userRequests.filter(d => d.statut === 'En attente').length, 
            cours: userRequests.filter(d => d.statut === 'En cours').length, 
            terminees: userRequests.filter(d => d.statut === 'Terminée').length, 
            annulees: userRequests.filter(d => d.statut === 'Annulée').length, 
            toutes: userRequests.length, 
        };
    }, [demandes, currentUser, isDEC1]);
    useEffect(() => {
        if (selectedDemande) {
            const updatedDemande = demandes.find(d => d.id === selectedDemande.id);
            setSelectedDemande(updatedDemande);
        }
    }, [demandes, selectedDemande]);

    return (
        <div className="management-page">
            <div className="management-header">
                <div className="container">
                    <h1>Gestion des demandes</h1>
                    <p>Bureau : <span>{currentUser}</span></p>
                    <div className="account-actions">
                        <NotificationBell onClick={handleBellClick} />
                        <button className="account-btn" onClick={() => setIsPasswordPopupOpen(true)}>Modifier le mot de passe</button>
                        <button className="logout-btn" onClick={onLogout}>Déconnexion</button>
                    </div>
                    {isPanelOpen && <NotificationPanel onNotificationClick={handleNotificationClick} onClear={() => setIsPanelOpen(false)} />}
                </div>
            </div>
            <div className="management-content">
                <div className="actions-bar">
                    <div className="main-actions">
                        <button className="new-request-btn" onClick={handleOpenPopup}>+ Nouvelle demande</button>
                        <button className="search-request-btn" onClick={handleOpenSearchPopup}>Rechercher une demande</button>
                    </div>
                    <div className="sort-buttons">
                        <span>Trier par:</span>
                        <button onClick={() => handleSort('echeance')} className={`sort-btn ${sortKey === 'echeance' ? 'active' : ''}`}>Échéance</button>
                        <button onClick={() => handleSort('dateCreation')} className={`sort-btn ${sortKey === 'dateCreation' ? 'active' : ''}`}>Date de création</button>
                    </div>
                </div>
                <div className="tabs-section">
                    <div className="tabs-header">
                        <button className={`tab-btn ${activeTab === 'attente' ? 'active' : ''}`} onClick={() => setActiveTab('attente')}>Demandes en attente (<span>{tabCounts.attente}</span>)</button>
                        <button className={`tab-btn ${activeTab === 'cours' ? 'active' : ''}`} onClick={() => setActiveTab('cours')}>Demandes en cours (<span>{tabCounts.cours}</span>)</button>
                        <button className={`tab-btn ${activeTab === 'terminees' ? 'active' : ''}`} onClick={() => setActiveTab('terminees')}>Demandes terminées (<span>{tabCounts.terminees}</span>)</button>
                        <button className={`tab-btn ${activeTab === 'annulees' ? 'active' : ''}`} onClick={() => setActiveTab('annulees')}>Missions annulées (<span>{tabCounts.annulees}</span>)</button>
                        <button className={`tab-btn ${activeTab === 'toutes' ? 'active' : ''}`} onClick={() => setActiveTab('toutes')}>Toutes les demandes (<span>{tabCounts.toutes}</span>)</button>
                    </div>
                    <div className="tab-content">
                        {filteredAndSortedDemandes.length === 0 ? (
                            <p className="no-demands-message">Aucune demande trouvée.</p>
                        ) : (
                            <div className="tab-panel active">
                                <div id="requestsList">
                                    {filteredAndSortedDemandes.map(demande => (
                                        <RequestCard 
                                            key={demande.id} 
                                            demande={demande} 
                                            onClick={() => handleCardClick(demande)}
                                            priorityClass={getPriorityClass(demande.echeance)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isPopupOpen && <NewRequestPopup currentUser={currentUser} onClose={handleClosePopup} onSubmit={handleNewDemandeSubmit} />}
            {isSearchPopupOpen && <SearchPopup onSearch={handleSearch} onClose={handleCloseSearchPopup} />}
            {selectedDemande && (
                <RequestDetailsPopup
                    demande={selectedDemande}
                    onClose={handleCloseDetailsPopup}
                    onUpdateStatus={handleUpdateStatus}
                    isDEC1={isDEC1}
                    currentUser={currentUser}
                    onDelete={triggerDeleteConfirmation}
                />
            )}
            {isPasswordPopupOpen && (
                <PasswordChangePopup
                    onClose={() => setIsPasswordPopupOpen(false)}
                    onChangePassword={handleChangePassword}
                />
            )}
            {alertInfo.show && (
                <AlertPopup 
                    title={alertInfo.title} 
                    message={alertInfo.message} 
                    onClose={() => setAlertInfo({ show: false, title: '', message: '' })}
                />
            )}
            {deleteConfirmation.show && (
                <ConfirmationPopup
                    message="Êtes-vous sûr de vouloir supprimer définitivement cette demande ? Cette action est irréversible."
                    onConfirm={handleDeleteRequest}
                    onCancel={() => setDeleteConfirmation({ show: false, demandeId: null })}
                />
            )}
        </div>
    );
}

export default ManagementPage;