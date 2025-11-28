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
                body: JSON.stringify(formData),
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
            setFormData({ name: '', age: '', gender: 'Male', phone: '', address: '' });
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
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
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1 block w-full border rounded-md shadow-sm p-2"
                        rows={2}
                    />
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
