import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserManagement from '../components/Admin/UserManagement';
import PatientRegistration from '../components/Reception/PatientRegistration';
import OPDQueue from '../components/Doctor/OPDQueue';
import LabDashboard from '../components/Lab/LabDashboard';
import PharmacyDashboard from '../components/Pharmacy/PharmacyDashboard';
import BedManagement from '../components/Beds/BedManagement';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">PHC OS</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">Welcome, {user?.name} ({user?.role})</span>
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </nav>
            <main className="p-8">
                <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Patients</h3>
                        <p className="text-3xl font-bold text-blue-600">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">OPD Queue</h3>
                        <p className="text-3xl font-bold text-green-600">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Pending Labs</h3>
                        <p className="text-3xl font-bold text-purple-600">0</p>
                    </div>
                </div>

                {user?.role === 'ADMIN' && <UserManagement />}
                {(user?.role === 'NURSE' || user?.role === 'ADMIN') && <PatientRegistration />}
                {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && <OPDQueue />}
                {(user?.role === 'LAB_TECH' || user?.role === 'ADMIN') && <LabDashboard />}
                {(user?.role === 'PHARMACIST' || user?.role === 'ADMIN') && <PharmacyDashboard />}
                {(user?.role === 'NURSE' || user?.role === 'ADMIN') && <BedManagement />}
            </main>
        </div>
    );
};

export default Dashboard;
