import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const PatientRegistration: React.FC = () => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        address: '',
        bloodGroup: '',
        emergencyContact: '',
        // Vitals
        weight: '',
        bp: '',
        sugar: '',
        temp: '',
        // Medical Background
        preExistingDiseases: '',
        allergies: '',
        isPregnant: false,
        patientType: 'OPD',
    });
    const [lastToken, setLastToken] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Create Patient
            const patientRes = await fetch('http://localhost:3000/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    age: parseInt(formData.age),
                    weight: formData.weight ? parseFloat(formData.weight) : null,
                    temp: formData.temp ? parseFloat(formData.temp) : null,
                }),
            });

            if (!patientRes.ok) throw new Error('Failed to register patient');
            const patient = await patientRes.json();

            // 2. Generate Token
            const visitRes = await fetch('http://localhost:3000/api/opd/visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ patientId: patient.id, symptoms: 'Walk-in' }),
            });

            if (!visitRes.ok) throw new Error('Failed to generate token');
            const visit = await visitRes.json();

            setLastToken(visit.tokenNo);
            setFormData({
                name: '', age: '', gender: 'Male', phone: '', address: '', bloodGroup: '', emergencyContact: '',
                weight: '', bp: '', sugar: '', temp: '',
                preExistingDiseases: '', allergies: '', isPregnant: false, patientType: 'OPD'
            });
            alert(`Patient Registered! Token No: ${visit.tokenNo}`);
        } catch (error) {
            console.error(error);
            alert('Registration failed');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Patient Registration</h3>
            {lastToken && (
                <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
                    Last Generated Token: <span className="font-bold text-2xl">#{lastToken}</span>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Demographics */}
                <div>
                    <h4 className="font-semibold mb-2 text-gray-700">Demographics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Age *</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gender *</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                            <select
                                value={formData.bloodGroup}
                                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            >
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                            <input
                                type="tel"
                                value={formData.emergencyContact}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            rows={2}
                        />
                    </div>
                </div>

                {/* Vitals */}
                <div>
                    <h4 className="font-semibold mb-2 text-gray-700">Vitals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">BP (e.g. 120/80)</label>
                            <input
                                type="text"
                                value={formData.bp}
                                onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Blood Sugar</label>
                            <input
                                type="text"
                                value={formData.sugar}
                                onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Temperature (°F)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.temp}
                                onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Medical Background */}
                <div>
                    <h4 className="font-semibold mb-2 text-gray-700">Medical Background</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pre-existing Diseases</label>
                            <input
                                type="text"
                                value={formData.preExistingDiseases}
                                onChange={(e) => setFormData({ ...formData, preExistingDiseases: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                                placeholder="e.g. Diabetes, Hypertension"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Allergies</label>
                            <input
                                type="text"
                                value={formData.allergies}
                                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                                placeholder="e.g. Penicillin, Peanuts"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Patient Type</label>
                            <select
                                value={formData.patientType}
                                onChange={(e) => setFormData({ ...formData, patientType: e.target.value })}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            >
                                <option value="OPD">OPD</option>
                                <option value="ADMITTED">Admitted</option>
                                <option value="REFERRED">Referred</option>
                            </select>
                        </div>
                        {formData.gender === 'Female' && (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isPregnant}
                                    onChange={(e) => setFormData({ ...formData, isPregnant: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm font-medium text-gray-700">
                                    Pregnant
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                >
                    Register & Generate Token
                </button>
            </form>
        </div>
    );
};

export default PatientRegistration;
