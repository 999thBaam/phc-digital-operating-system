import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Prescription {
    id: string;
    medicine: string;
    status: string;
    opdVisit: {
        patient: {
            name: string;
        };
    };
}

const PharmacyDashboard: React.FC = () => {
    const { token } = useAuth();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

    useEffect(() => {
        fetchPrescriptions();
        const interval = setInterval(fetchPrescriptions, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/pharmacy/prescriptions', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setPrescriptions(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const dispense = async (id: string) => {
        if (!confirm('Confirm dispense?')) return;

        try {
            const res = await fetch(`http://localhost:3000/api/pharmacy/dispense/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                fetchPrescriptions();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Pharmacy Dashboard</h3>
            {prescriptions.length === 0 ? (
                <p className="text-gray-500">No pending prescriptions.</p>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map((p) => (
                        <div key={p.id} className="border p-4 rounded flex justify-between items-center">
                            <div>
                                <p className="font-bold">{p.medicine}</p>
                                <p className="text-sm text-gray-600">Patient: {p.opdVisit.patient.name}</p>
                            </div>
                            <button
                                onClick={() => dispense(p.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Dispense
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PharmacyDashboard;
