import React, { useState } from 'react';
import DemandeStatus from './DemandeStatus';

function SearchPopup({ onSearch, onClose }) {
    const [criteres, setCriteres] = useState({
        bureau: '',
        domaine: '',
        specialite: '',
        epreuve: '',
        gestionnaire: '',
        codeCentre: '',
        libelleCentre: '',
        ville: '',
        date: '',
        numeroMission: '',
        referenceNumber: '',
        nomIntervenant: '',
        gestionnaireDEC1: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCriteres(prevCriteres => ({ ...prevCriteres, [name]: value }));
    };

    const handleSearchClick = () => {
        onSearch(criteres);
        onClose();
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h2>Recherche avancée</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="form-section">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Bureau</label>
                            <input type="text" name="bureau" value={criteres.bureau} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Domaine Examen</label>
                            <input type="text" name="domaine" value={criteres.domaine} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Spécialité</label>
                            <input type="text" name="specialite" value={criteres.specialite} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Épreuve</label>
                            <input type="text" name="epreuve" value={criteres.epreuve} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Gestionnaire</label>
                            <input type="text" name="gestionnaire" value={criteres.gestionnaire} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Code centre</label>
                            <input type="text" name="codeCentre" value={criteres.codeCentre} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Libellé centre</label>
                            <input type="text" name="libelleCentre" value={criteres.libelleCentre} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Ville</label>
                            <input type="text" name="ville" value={criteres.ville} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" name="date" value={criteres.date} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Numéro de mission</label>
                            <input type="text" name="numeroMission" value={criteres.numeroMission} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Numéro de référence</label>
                            <input type="text" name="referenceNumber" value={criteres.referenceNumber} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Nom intervenant</label>
                            <input type="text" name="nomIntervenant" value={criteres.nomIntervenant} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row full-width">
                        <div className="form-group">
                            <label>Gestionnaire DEC1</label>
                            <input type="text" name="gestionnaireDEC1" value={criteres.gestionnaireDEC1} onChange={handleChange} />
                        </div>
                    </div>
                    <div style={{textAlign: 'center', marginTop: '20px'}}>
                        <button className="submit-btn" onClick={handleSearchClick}>Rechercher</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchPopup;