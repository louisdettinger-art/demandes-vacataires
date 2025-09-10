import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot } from "firebase/firestore"; 
import NewRequestPopup from './NewRequestPopup';
import RequestCard from './RequestCard';
import RequestDetailsPopup from './RequestDetailsPopup';
import AnnulationPopup from './AnnulationPopup';
import SearchPopup from './SearchPopup';

function ManagementPage({ currentUser, onLogout }) {
    const [demandes, setDemandes] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('attente'); // LIGNE CORRIGÉE
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [searchCriteres, setSearchCriteres] = useState({});
    const isDEC1 = currentUser === 'DEC1';
    const [sortKey, setSortKey] = useState('dateCreation');
    const [sortDirection, setSortDirection] = useState('desc');

    useEffect(() => {
        const q = collection(db, "demandes");
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const demandesData = [];
            querySnapshot.forEach((doc) => {
                demandesData.push({ id: doc.id, ...doc.data() });
            });
            setDemandes(demandesData);
        }, (error) => {
            console.error("Erreur d'écoute de la base de données : ", error);
            alert("Impossible de se connecter à la base de données en temps réel.");
        });

        return () => unsubscribe();
    }, []);

    const handleOpenPopup = () => setIsPopupOpen(true);
    const handleClosePopup = () => setIsPopupOpen(false);
    const handleOpenSearchPopup = () => setIsSearchPopupOpen(true);
    const handleCloseSearchPopup = () => setIsSearchPopupOpen(false);

    const handleSearch = (criteres) => {
        setSearchCriteres(criteres);
        setActiveTab('toutes');
        handleCloseSearchPopup();
    };

    const handleNewDemandeSubmit = async (newDemande) => {
        console.log("handleNewDemandeSubmit a bien été appelée avec les données :", newDemande);

        try {
            const referenceNumber = Math.floor(100000 + Math.random() * 900000);
            const finalDemande = {
                referenceNumber: `DEM-${referenceNumber}`,
                bureau: currentUser,
                titreComplet: `${newDemande.domaine}${newDemande.specialite ? ` - ${newDemande.specialite}` : ''}${newDemande.epreuve ? ` (${newDemande.epreuve})` : ''}`,
                statut: 'En attente',
                dateCreation: new Date().toISOString(),
                ...newDemande,
                intervenantsRecrutes: [],
                numeroMission: '',
                gestionnaireDEC1: ''
            };

            await addDoc(collection(db, "demandes"), finalDemande);
            
            handleClosePopup();
            alert('Demande créée avec succès !');

        } catch (error) {
            console.error("Erreur lors de l'ajout de la demande : ", error);
            alert("Une erreur est survenue. La demande n'a pas pu être créée.");
        }
    };

    const handleCardClick = (demande) => setSelectedDemande(demande);
    const handleCloseDetailsPopup = () => setSelectedDemande(null);

    const handleUpdateStatus = (id, newStatus, updatedData) => {
        const updatedDemandes = demandes.map(demande => {
            if (demande.id === id) {
                return { ...demande, ...updatedData, statut: newStatus };
            }
            return demande;
        });
        setDemandes(updatedDemandes);
        setSelectedDemande(prev => ({ ...prev, ...updatedData, statut: newStatus }));
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
                    if (key === 'nomIntervenant') {
                        return demande.intervenantsRecrutes?.some(name => name.toLowerCase().includes(lowerValue));
                    }
                    if (key === 'date') {
                        return demande.intervenants?.flatMap(int => int.dates?.map(d => d.date)).includes(value);
                    }
                    const demandeValue = String(demande[key] || '').toLowerCase();
                    return demandeValue.includes(lowerValue);
                });
            });
        }
        
        if (activeTab !== 'toutes') {
            const statutMap = {
                attente: 'En attente',
                cours: 'En cours',
                terminees: 'Terminée',
                annulees: 'Annulée'
            };
            filtered = filtered.filter(d => d.statut === statutMap[activeTab]);
        }

        return [...filtered].sort((a, b) => {
            let aValue = a[sortKey];
            let bValue = b[sortKey];
            
            if (sortKey === 'dateCreation') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
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

    return (
        <div className="management-page">
            <div className="management-header">
                <div className="container">
                    <button className="logout-btn" onClick={onLogout}>Déconnexion</button>
                    <h1>Gestion des demandes</h1>
                    <p>Bureau : <span>{currentUser}</span></p>
                </div>
            </div>
            <div className="management-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button className="new-request-btn" onClick={handleOpenPopup}>+ Nouvelle demande</button>
                    <button className="new-request-btn" onClick={handleOpenSearchPopup}>Rechercher une demande</button>
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
                                        <RequestCard key={demande.id} demande={demande} onClick={() => handleCardClick(demande)} />
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
                />
            )}
        </div>
    );
}

export default ManagementPage;