import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Reports: React.FC = () => {
    const { token } = useAuth();

    const downloadReport = async (type: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/reports/${type}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Failed to download report', error);
            alert('Failed to download report');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h3 className="text-xl font-bold mb-4">Daily Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                    onClick={() => downloadReport('opd')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                    <span>📄</span> OPD List
                </button>
                <button
                    onClick={() => downloadReport('admissions')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                >
                    <span>🛏️</span> Admissions
                </button>
                <button
                    onClick={() => downloadReport('pharmacy')}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                    <span>💊</span> Pharmacy
                </button>
                <button
                    onClick={() => downloadReport('lab')}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center justify-center gap-2"
                >
                    <span>🧪</span> Lab Tests
                </button>
            </div>
        </div>
    );
};

export default Reports;
