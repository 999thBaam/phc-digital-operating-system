import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface LabOrder {
    id: string;
    testName: string;
    status: string;
    opdVisit: {
        patient: {
            name: string;
        };
    };
}

const LabDashboard: React.FC = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState<LabOrder[]>([]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/lab/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const completeOrder = async (id: string) => {
        const result = prompt('Enter Test Result:');
        if (!result) return;

        try {
            const res = await fetch(`http://localhost:3000/api/lab/complete/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ result }),
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Lab Dashboard</h3>
            {orders.length === 0 ? (
                <p className="text-gray-500">No pending tests.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="border p-4 rounded flex justify-between items-center">
                            <div>
                                <p className="font-bold">{order.testName}</p>
                                <p className="text-sm text-gray-600">Patient: {order.opdVisit.patient.name}</p>
                            </div>
                            <button
                                onClick={() => completeOrder(order.id)}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                            >
                                Upload Result
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LabDashboard;
