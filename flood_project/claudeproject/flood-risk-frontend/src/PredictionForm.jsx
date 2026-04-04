import React, { useState } from 'react';

const PredictionForm = () => {
    const [formData, setFormData] = useState({
        location_name: '',
        pin_code: '',
        rainfall_intensity: '',
        drainage_condition: '3', // Default 1-5
        soil_permeability: '0.5', // Default 0-1
        land_use_type: '1', // 1: Rural, 2: Suburban, 3: Urban
        historical_flood_records: '0', // 0: No, 1: Yes
        elevation: ''
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://10.10.10.147:5000/api/predictions/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            alert("Error: Ensure your Flask Backend is running!");
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial' }}>
            <h2>Flood Risk Assessment</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                <input placeholder="Location Name" onChange={e => setFormData({ ...formData, location_name: e.target.value })} required style={styles.input} />
                <input placeholder="Pin Code" onChange={e => setFormData({ ...formData, pin_code: e.target.value })} required style={styles.input} />
                <input type="number" placeholder="Rainfall Intensity (mm)" onChange={e => setFormData({ ...formData, rainfall_intensity: e.target.value })} required style={styles.input} />
                <input type="number" placeholder="Elevation (meters)" onChange={e => setFormData({ ...formData, elevation: e.target.value })} required style={styles.input} />

                <div>
                    <label>Drainage Condition (1: Excellent - 5: Poor)</label>
                    <input type="range" min="1" max="5" onChange={e => setFormData({ ...formData, drainage_condition: e.target.value })} style={{ width: '100%' }} />
                </div>

                <select onChange={e => setFormData({ ...formData, land_use_type: e.target.value })} style={styles.input}>
                    <option value="1">Rural Area</option>
                    <option value="2">Suburban Area</option>
                    <option value="3">Urban Area</option>
                </select>

                <button type="submit" style={styles.button}>
                    {loading ? "Calculating..." : "Predict Flood Risk"}
                </button>
            </form>

            {result && (
                <div style={{
                    marginTop: '20px', padding: '20px', borderRadius: '8px', color: 'white',
                    backgroundColor: result.risk_level === 'HIGH' ? '#e74c3c' : (result.risk_level === 'MEDIUM' ? '#f39c12' : '#27ae60')
                }}>
                    <h3>Assessment for {result.location}</h3>
                    <p><strong>Risk Level:</strong> {result.risk_level}</p>
                    <p><strong>Confidence Score:</strong> {(result.confidence * 100).toFixed(1)}%</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '12px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default PredictionForm;
