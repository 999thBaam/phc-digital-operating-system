import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Bed {
    id: string;
    number: string;
    isOccupied: boolean;
    admissions: Array<{
        patient: {
            name: string;
            age: number;
        };
    }>;
}

const BedManagement: React.FC = () => {
    const { token } = useAuth();
    const [beds, setBeds] = useState<Bed[]>([]);

    useEffect(() => {
        fetchBeds();
        const interval = setInterval(fetchBeds, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchBeds = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/beds', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setBeds(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const discharge = async (bedId: string) => {
        if (!confirm('Confirm discharge?')) return;

        try {
            const res = await fetch(`http://localhost:3000/api/beds/discharge/${bedId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                fetchBeds();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Bed Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {beds.map((bed) => (
                    <div
                        key={bed.id}
                        className={`p-4 border-2 rounded-lg ${bed.isOccupied ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                            }`}
                    >
                        <h4 className="font-bold text-lg mb-2">{bed.number}</h4>
                        <div className={`text-sm font-semibold mb-2 ${bed.isOccupied ? 'text-red-600' : 'text-green-600'}`}>
                            {bed.isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
                        </div>
                        {bed.isOccupied && bed.admissions[0] && (
                            <div className="mt-2">
                                <p className="text-sm font-semibold">{bed.admissions[0].patient.name}</p>
                                <p className="text-xs text-gray-600">{bed.admissions[0].patient.age}y</p>
                                <button
                                    onClick={() => discharge(bed.id)}
                                    className="mt-2 w-full bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                                >
                                    Discharge
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BedManagement;
