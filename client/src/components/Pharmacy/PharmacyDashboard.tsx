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
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

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

    const openModal = (prescription: Prescription) => {
        setSelectedPrescription(prescription);
    };

    const closeModal = () => {
        setSelectedPrescription(null);
    };

    const dispense = async () => {
        if (!selectedPrescription) return;

        try {
            const res = await fetch(`http://localhost:3000/api/pharmacy/dispense/${selectedPrescription.id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                fetchPrescriptions();
                closeModal();
                alert('Medicine dispensed successfully!');
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
                                onClick={() => openModal(p)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Dispense
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h4 className="text-lg font-bold mb-4">Confirm Dispensing</h4>
                        <p className="text-sm text-gray-600 mb-2">Medicine: <span className="font-semibold">{selectedPrescription.medicine}</span></p>
                        <p className="text-sm text-gray-600 mb-4">Patient: <span className="font-semibold">{selectedPrescription.opdVisit.patient.name}</span></p>
                        <p className="text-gray-700 mb-6">Are you sure you want to mark this prescription as dispensed?</p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={dispense}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Confirm Dispense
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyDashboard;
