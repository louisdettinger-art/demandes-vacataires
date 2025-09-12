import React, { useState } from 'react';
import etablissementsData from '../etablissements.json';

function NewRequestPopup({ currentUser, onClose, onSubmit, templateData }) {
    
    const getInitialState = () => {
        // L'état par défaut pour une demande vierge ou réinitialisée
        const defaultState = {
            bureau: currentUser,
            domaine: '', specialite: '', epreuve: '', gestionnaire: '',
            intervenants: [{ type: '', nombre: 1, dates: [{ date: '', heureDebut: '', heureFin: '', pauseMeridienne: false }] }],
            codeCentre: '', libelleCentre: '', ville: '', codePostal: '',
            observations: '',
            // On s'assure que ces champs sont aussi dans l'état par défaut
            statut: 'En attente',
            intervenantsRecrutes: [],
            numeroMission: '',
            gestionnaireDEC1: '',
            motifAnnulation: '',
        };

        if (templateData) {
            // Si on a un modèle, on prend certaines de ses valeurs...
            return {
                ...defaultState, // On commence avec une base vierge
                domaine: templateData.domaine,
                specialite: templateData.specialite,
                epreuve: templateData.epreuve,
                gestionnaire: templateData.gestionnaire,
                codeCentre: templateData.codeCentre,
                libelleCentre: templateData.libelleCentre,
                ville: templateData.ville,
                codePostal: templateData.codePostal,
                observations: templateData.observations,
            };
        }
        // Sinon, on retourne l'état vierge complet
        return defaultState;
    };

    const [demande, setDemande] = useState(getInitialState());
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

    const isFormValid = () => {
        const requiredFields = ['domaine', 'gestionnaire', 'codeCentre', 'libelleCentre', 'ville', 'codePostal'];
        const isMainFormValid = requiredFields.every(field => demande[field] && String(demande[field]).trim() !== '');
        const hasValidIntervenants = demande.intervenants.some(intervenant =>
            intervenant.type && intervenant.nombre > 0 && intervenant.dates.some(date => date.date && date.heureDebut && date.heureFin)
        );
        return isMainFormValid && hasValidIntervenants;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setDemande(prev => ({ ...prev, [id]: value }));
    };

    const handleCodeCentreChange = (e) => {
        const value = e.target.value;
        setDemande(prev => ({ ...prev, codeCentre: value, libelleCentre: '', ville: '', codePostal: '' }));

        if (value.length > 2) {
            const filtered = etablissementsData.filter(etab => 
                etab.code && etab.code.toLowerCase().startsWith(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
            setIsSuggestionsOpen(true);
        } else {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
        }
    };

    const handleSuggestionClick = (etablissement) => {
        setDemande(prev => ({
            ...prev,
            codeCentre: etablissement.code,
            libelleCentre: etablissement.libelle,
            ville: etablissement.ville,
            codePostal: etablissement.codePostal || ''
        }));
        setIsSuggestionsOpen(false);
        setSuggestions([]);
    };

    const handleIntervenantChange = (e, index) => {
        const { name, value } = e.target;
        const newIntervenants = [...demande.intervenants];
        newIntervenants[index] = { ...newIntervenants[index], [name]: value };
        setDemande(prevDemande => ({ ...prevDemande, intervenants: newIntervenants }));
    };

    const handleDateChange = (e, intervenantIndex, dateIndex) => {
        const { name, value, type, checked } = e.target;
        const newIntervenants = [...demande.intervenants];
        const newDates = [...newIntervenants[intervenantIndex].dates];
        newDates[dateIndex] = { ...newDates[dateIndex], [name]: type === 'checkbox' ? checked : value };
        newIntervenants[intervenantIndex].dates = newDates;
        setDemande(prevDemande => ({ ...prevDemande, intervenants: newIntervenants }));
    };

    const addIntervenant = () => {
        setDemande(prevDemande => ({
            ...prevDemande,
            intervenants: [...prevDemande.intervenants, { type: '', nombre: 1, dates: [{ date: '', heureDebut: '', heureFin: '', pauseMeridienne: false }] }]
        }));
    };

    const removeIntervenant = (index) => {
        const newIntervenants = [...demande.intervenants];
        newIntervenants.splice(index, 1);
        setDemande(prevDemande => ({ ...prevDemande, intervenants: newIntervenants }));
    };

    const addDate = (intervenantIndex) => {
        const newIntervenants = [...demande.intervenants];
        newIntervenants[intervenantIndex].dates.push({ date: '', heureDebut: '', heureFin: '', pauseMeridienne: false });
        setDemande(prevDemande => ({ ...prevDemande, intervenants: newIntervenants }));
    };

    const removeDate = (intervenantIndex, dateIndex) => {
        const newIntervenants = [...demande.intervenants];
        const newDates = [...newIntervenants[intervenantIndex].dates];
        newDates.splice(dateIndex, 1);
        newIntervenants[intervenantIndex].dates = newDates;
        setDemande(prevDemande => ({ ...prevDemande, intervenants: newIntervenants }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(demande);
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-header">
                    <h2>Nouvelle demande d'intervenant</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} autoComplete="off">
                    <section className="form-section">
                        <h4>Informations générales</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Bureau</label>
                                <input type="text" value={demande.bureau} readOnly style={{ background: '#f8f9fa' }} />
                            </div>
                            <div className="form-group">
                                <label>Domaine examen <span className="required">*</span></label>
                                <input type="text" id="domaine" name="domaine" value={demande.domaine} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Spécialité</label>
                                <input type="text" id="specialite" name="specialite" value={demande.specialite} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Épreuve</label>
                                <input type="text" id="epreuve" name="epreuve" value={demande.epreuve} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row full-width">
                            <div className="form-group">
                                <label>Gestionnaire <span className="required">*</span></label>
                                <input type="text" id="gestionnaire" name="gestionnaire" placeholder="Nom et prénom" value={demande.gestionnaire} onChange={handleChange} required />
                            </div>
                        </div>
                    </section>

                    <section className="form-section">
                        <h4>Lieu de l'examen</h4>
                        <div className="form-row">
                            <div className="form-group autocomplete-container">
                                <label>Code centre <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    id="codeCentre" 
                                    name="codeCentre" 
                                    value={demande.codeCentre} 
                                    onChange={handleCodeCentreChange} 
                                    required 
                                />
                                {isSuggestionsOpen && suggestions.length > 0 && (
                                    <ul className="suggestions-list">
                                        {suggestions.map((etab) => (
                                            <li key={etab.code} onClick={() => handleSuggestionClick(etab)}>
                                                <strong>{etab.code}</strong> - {etab.libelle}, {etab.ville}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Libellé centre <span className="required">*</span></label>
                                <input type="text" id="libelleCentre" name="libelleCentre" value={demande.libelleCentre} onChange={handleChange} required readOnly style={{ background: '#f8f9fa' }}/>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Ville <span className="required">*</span></label>
                                <input type="text" id="ville" name="ville" value={demande.ville} onChange={handleChange} required readOnly style={{ background: '#f8f9fa' }}/>
                            </div>
                            <div className="form-group">
                                <label>Code Postal <span className="required">*</span></label>
                                <input type="text" id="codePostal" name="codePostal" value={demande.codePostal} onChange={handleChange} required />
                            </div>
                        </div>
                    </section>

                    <section className="form-section">
                        <h4>Intervenants requis</h4>
                        <div id="intervenants-container">
                            {demande.intervenants.map((intervenant, intervenantIndex) => (
                                <div className="intervenant-group" key={intervenantIndex}>
                                    <div className="intervenant-row">
                                        <div className="form-group">
                                            <label>Type d'intervenant</label>
                                            <select name="type" value={intervenant.type} onChange={(e) => handleIntervenantChange(e, intervenantIndex)} required >
                                                <option value="">Sélectionner un type</option>
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
                                            <input type="number" name="nombre" placeholder="Nombre" min="1" value={intervenant.nombre} onChange={(e) => handleIntervenantChange(e, intervenantIndex)} required />
                                        </div>
                                        {demande.intervenants.length > 1 && (
                                            <button type="button" className="remove-btn" onClick={() => removeIntervenant(intervenantIndex)}>
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                    <div className="dates-intervenant">
                                        <h5 style={{ margin: '15px 0 10px 0', color: '#495057', fontSize: '14px' }}>Dates et horaires :</h5>
                                        {intervenant.dates.map((date, dateIndex) => (
                                            <div className="date-row" key={dateIndex}>
                                                <div className="form-group">
                                                    <label>Date</label>
                                                    <input type="date" name="date" value={date.date} onChange={(e) => handleDateChange(e, intervenantIndex, dateIndex)} required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Heure début</label>
                                                    <input type="time" name="heureDebut" value={date.heureDebut} onChange={(e) => handleDateChange(e, intervenantIndex, dateIndex)} required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Heure fin</label>
                                                    <input type="time" name="heureFin" value={date.heureFin} onChange={(e) => handleDateChange(e, intervenantIndex, dateIndex)} required />
                                                </div>
                                                <div className="form-group pause-checkbox">
                                                    <input type="checkbox" name="pauseMeridienne" checked={date.pauseMeridienne} onChange={(e) => handleDateChange(e, intervenantIndex, dateIndex)} id={`pause-${intervenantIndex}-${dateIndex}`} />
                                                    <label htmlFor={`pause-${intervenantIndex}-${dateIndex}`}>Pause méridienne</label>
                                                </div>
                                                {intervenant.dates.length > 1 && (
                                                    <button type="button" className="remove-btn" onClick={() => removeDate(intervenantIndex, dateIndex)}>
                                                        X
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" className="add-date-btn" onClick={() => addDate(intervenantIndex)}>
                                            + Ajouter une date
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="add-btn" onClick={addIntervenant}>+ Ajouter un type d'intervenant</button>
                    </section>

                    <section className="form-section">
                        <h4>Observations</h4>
                        <div className="form-row full-width">
                            <div className="form-group">
                                <label>Observations</label>
                                <textarea id="observations" name="observations" rows="4" value={demande.observations} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </section>

                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e9ecef' }}>
                        <button type="submit" className="submit-btn" disabled={!isFormValid()}>Envoyer la demande</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewRequestPopup;