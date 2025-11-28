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
    const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
    const [result, setResult] = useState('');

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

    const openModal = (order: LabOrder) => {
        setSelectedOrder(order);
        setResult('');
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setResult('');
    };

    const completeOrder = async () => {
        if (!result.trim() || !selectedOrder) return;

        try {
            const res = await fetch(`http://localhost:3000/api/lab/complete/${selectedOrder.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ result }),
            });
            if (res.ok) {
                fetchOrders();
                closeModal();
                alert('Result uploaded successfully!');
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
                                onClick={() => openModal(order)}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                            >
                                Upload Result
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h4 className="text-lg font-bold mb-4">Upload Test Result</h4>
                        <p className="text-sm text-gray-600 mb-2">Test: {selectedOrder.testName}</p>
                        <p className="text-sm text-gray-600 mb-4">Patient: {selectedOrder.opdVisit.patient.name}</p>
                        <textarea
                            value={result}
                            onChange={(e) => setResult(e.target.value)}
                            className="w-full border p-2 rounded mb-4"
                            rows={4}
                            placeholder="Enter test result..."
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={completeOrder}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                                disabled={!result.trim()}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabDashboard;
