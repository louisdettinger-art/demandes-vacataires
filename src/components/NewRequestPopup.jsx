import React, { useState } from 'react';

function NewRequestPopup({ currentUser, onClose, onSubmit }) {
    const [demande, setDemande] = useState({
        bureau: currentUser,
        domaine: '',
        specialite: '',
        epreuve: '',
        gestionnaire: '',
        intervenants: [{ type: '', nombre: 1, dates: [{ date: '', heureDebut: '', heureFin: '', pauseMeridienne: false }] }],
        codeCentre: '',
        libelleCentre: '',
        ville: '',
        observations: ''
    });

    const isFormValid = () => {
        const requiredFields = ['domaine', 'gestionnaire', 'codeCentre', 'libelleCentre', 'ville'];
        const isMainFormValid = requiredFields.every(field => demande[field] && demande[field].trim() !== '');

        const hasValidIntervenants = demande.intervenants.some(intervenant =>
            intervenant.type && intervenant.nombre > 0 && intervenant.dates.some(date => date.date && date.heureDebut && date.heureFin)
        );

        return isMainFormValid && hasValidIntervenants;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setDemande(prevDemande => ({ ...prevDemande, [id]: value }));
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
        const newDates = [...newIntervenants[intervenantIndex].dates, { date: '', heureDebut: '', heureFin: '', pauseMeridienne: false }];
        newIntervenants[intervenantIndex].dates = newDates;
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
        onClose();
    };

    return (
        <div className="popup-overlay" style={{ display: 'flex' }}>
            <div className="popup-content">
                <div className="popup-header">
                    <h2>Nouvelle demande d'intervenant</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
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
                            <div className="form-group">
                                <label>Code centre <span className="required">*</span></label>
                                <input type="text" id="codeCentre" name="codeCentre" value={demande.codeCentre} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Libellé centre <span className="required">*</span></label>
                                <input type="text" id="libelleCentre" name="libelleCentre" value={demande.libelleCentre} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row full-width">
                            <div className="form-group">
                                <label>Ville <span className="required">*</span></label>
                                <input type="text" id="ville" name="ville" value={demande.ville} onChange={handleChange} required />
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
                                            <select
                                                className="intervenant-type"
                                                name="type"
                                                value={intervenant.type}
                                                onChange={(e) => handleIntervenantChange(e, intervenantIndex)}
                                                required
                                            >
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
                                            <input
                                                type="number"
                                                className="intervenant-nombre"
                                                name="nombre"
                                                placeholder="Nombre"
                                                min="1"
                                                value={intervenant.nombre}
                                                onChange={(e) => handleIntervenantChange(e, intervenantIndex)}
                                                required
                                            />
                                        </div>
                                        {demande.intervenants.length > 1 && (
                                            <button type="button" className="remove-btn" onClick={() => removeIntervenant(intervenantIndex)}>
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                    <div className="dates-intervenant">
                                        <h5 style={{ margin: '15px 0 10px 0', color: '#495057', fontSize: '14px' }}>Dates et horaires :</h5>
                                        <div className="dates-container-intervenant">
                                            {intervenant.dates.map((date, dateIndex) => (
                                                <div className="date-group" key={dateIndex}>
                                                    <div className="date-row">
                                                        <div className="form-group">
                                                            <label>Date</label>
                                                            <input
                                                                type="date"
                                                                className="date-field"
                                                                name="date"
                                                                value={date.date}
                                                                onChange={(e) => handleDateChange(e, intervenantIndex, dateIndex)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Heure début</label>
                                                            <input
                                                                type="time"
                                                                className="time-start"
                                                                name="heureDebut"
                                                                value={date.heureDebut}
                                                                onChange={(e) => handleDateChange(e, intervenantIndex, dateIndex)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Heure fin</label>
                                                            <input
                                                                type="time"
                                                                className="time-end"
                                                                name="heureFin"
                                                                value={date.heureFin}
                                                                onChange={(e) => handleDateChange(e, intervenantIndex, dateIndex)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="form-group pause-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="pause-meridienne"
                                                                name="pauseMeridienne"
                                                                checked={date.pauseMeridienne}
                                                                onChange={(e) => handleDateChange(e, intervenantIndex, dateIndex)}
                                                                id={`pause-${intervenantIndex}-${dateIndex}`}
                                                            />
                                                            <label htmlFor={`pause-${intervenantIndex}-${dateIndex}`}>Pause méridienne</label>
                                                        </div>
                                                        {intervenant.dates.length > 1 && (
                                                            <button type="button" className="remove-date-btn" onClick={() => removeDate(intervenantIndex, dateIndex)}>
                                                                Supprimer
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" className="add-date-btn" onClick={() => addDate(intervenantIndex)}>
                                            + Ajouter une autre date
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="add-btn" onClick={addIntervenant}>+ Ajouter un autre type d'intervenant</button>
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