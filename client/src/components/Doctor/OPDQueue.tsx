import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface OPDVisit {
    id: string;
    tokenNo: number;
    status: string;
    patient: {
        name: string;
        age: number;
        gender: string;
    };
    symptoms: string;
}

const OPDQueue: React.FC = () => {
    const { token } = useAuth();
    const [queue, setQueue] = useState<OPDVisit[]>([]);
    const [selectedVisit, setSelectedVisit] = useState<OPDVisit | null>(null);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchQueue = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/opd/queue', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setQueue(data);
            }
        } catch (error) {
            console.error('Failed to fetch queue', error);
        }
    };

    const startConsultation = (visit: OPDVisit) => {
        setSelectedVisit(visit);
        // In a real app, we'd update status to IN_CONSULTATION here
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Queue List */}
            <div className="col-span-1 bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">OPD Queue</h3>
                <div className="space-y-4">
                    {queue.length === 0 ? (
                        <p className="text-gray-500">No patients waiting.</p>
                    ) : (
                        queue.map((visit) => (
                            <div
                                key={visit.id}
                                onClick={() => startConsultation(visit)}
                                className={`p-4 border rounded cursor-pointer hover:bg-blue-50 ${selectedVisit?.id === visit.id ? 'bg-blue-100 border-blue-500' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">#{visit.tokenNo}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${visit.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {visit.status}
                                    </span>
                                </div>
                                <p className="font-semibold">{visit.patient.name}</p>
                                <p className="text-sm text-gray-600">{visit.patient.gender}, {visit.patient.age}y</p>
                                <p className="text-sm text-gray-500 mt-1">{visit.symptoms}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Consultation Area */}
            <div className="col-span-2 bg-white p-6 rounded-lg shadow">
                {selectedVisit ? (
                    <ConsultationForm visit={selectedVisit} token={token!} onComplete={() => {
                        setSelectedVisit(null);
                        fetchQueue();
                    }} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a patient from the queue to start consultation.
                    </div>
                )}
            </div>
        </div>
    );
};

const ConsultationForm: React.FC<{ visit: OPDVisit; token: string; onComplete: () => void }> = ({ visit, token, onComplete }) => {
    const [vitals, setVitals] = useState({ weight: '', bp: '', temp: '' });
    const [diagnosis, setDiagnosis] = useState('');
    const [prescription, setPrescription] = useState('');
    const [labTests, setLabTests] = useState<string[]>([]);
    const [newTest, setNewTest] = useState('');

    const commonTests = [
        'Complete Blood Count (CBC)',
        'Blood Sugar (Fasting)',
        'Blood Sugar (Random)',
        'Urine Routine',
        'Hemoglobin',
        'Malaria Test',
        'Dengue Test',
        'Typhoid Test',
    ];

    const addLabTest = (testName: string) => {
        if (testName && !labTests.includes(testName)) {
            setLabTests([...labTests, testName]);
            setNewTest('');
        }
    };

    const removeLabTest = (testName: string) => {
        setLabTests(labTests.filter(t => t !== testName));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Update OPD Visit with vitals/diagnosis
            // Create Prescription
            // Mark as COMPLETED
            // For MVP, we'll just hit a 'complete' endpoint (to be created)
            const res = await fetch(`http://localhost:3000/api/opd/consult/${visit.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ vitals, diagnosis, prescription, labTests }),
            });

            if (res.ok) {
                alert('Consultation Completed');
                onComplete();
            } else {
                alert('Failed to complete consultation');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Consultation: {visit.patient.name}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vitals */}
                <div>
                    <h4 className="font-semibold mb-2">Vitals</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <input
                            placeholder="Weight (kg)"
                            value={vitals.weight}
                            onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                            className="border p-2 rounded"
                        />
                        <input
                            placeholder="BP (e.g. 120/80)"
                            value={vitals.bp}
                            onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                            className="border p-2 rounded"
                        />
                        <input
                            placeholder="Temp (°F)"
                            value={vitals.temp}
                            onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                            className="border p-2 rounded"
                        />
                    </div>
                </div>

                {/* Diagnosis */}
                <div>
                    <h4 className="font-semibold mb-2">Diagnosis & Notes</h4>
                    <textarea
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full border p-2 rounded h-24"
                        placeholder="Enter clinical notes and diagnosis..."
                        required
                    />
                </div>

                {/* Lab Tests */}
                <div>
                    <h4 className="font-semibold mb-2">Lab Tests</h4>
                    <div className="mb-2">
                        <select
                            value={newTest}
                            onChange={(e) => addLabTest(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">-- Select a test --</option>
                            {commonTests.map(test => (
                                <option key={test} value={test}>{test}</option>
                            ))}
                        </select>
                    </div>
                    {labTests.length > 0 && (
                        <div className="space-y-2">
                            {labTests.map(test => (
                                <div key={test} className="flex justify-between items-center bg-purple-50 p-2 rounded">
                                    <span className="text-sm">{test}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeLabTest(test)}
                                        className="text-red-600 text-sm hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Prescription */}
                <div>
                    <h4 className="font-semibold mb-2">Prescription</h4>
                    <textarea
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        className="w-full border p-2 rounded h-24"
                        placeholder="Medicine Name - Dosage (e.g. Paracetamol - 500mg BD)"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700"
                >
                    Complete Consultation
                </button>
            </form>
        </div>
    );
};

export default OPDQueue;
