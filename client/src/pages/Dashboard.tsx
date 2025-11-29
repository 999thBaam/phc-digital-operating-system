import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserManagement from '../components/Admin/UserManagement';
import Reports from '../components/Admin/Reports';
import PatientRegistration from '../components/Reception/PatientRegistration';
import OPDQueue from '../components/Doctor/OPDQueue';
import LabDashboard from '../components/Lab/LabDashboard';
import PharmacyDashboard from '../components/Pharmacy/PharmacyDashboard';
import BedManagement from '../components/Beds/BedManagement';
import SuperAdminDashboard from '../components/SuperAdmin/SuperAdminDashboard';

const Dashboard: React.FC = () => {
    const { user, logout, token } = useAuth();
    const [stats, setStats] = useState({
        patients: 0,
        opdQueue: 0,
        pendingLabs: 0
    });

    useEffect(() => {
        if (user && user.role !== 'SUPER_ADMIN') {
            fetchStats();
            const interval = setInterval(fetchStats, 10000); // Update every 10s
            return () => clearInterval(interval);
        }
    }, [user?.role]);

    const fetchStats = async () => {
        try {
            const newStats = { patients: 0, opdQueue: 0, pendingLabs: 0 };

            // Fetch patient count (ADMIN, NURSE, DOCTOR can access)
            if (['ADMIN', 'NURSE', 'DOCTOR'].includes(user?.role || '')) {
                try {
                    const patientsRes = await fetch('http://localhost:3000/api/patients/search?query=', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (patientsRes.ok) {
                        const patients = await patientsRes.json();
                        newStats.patients = patients.length;
                    }
                } catch (error) {
                    console.error('Failed to fetch patients', error);
                }
            }

            // Fetch OPD queue (ADMIN, NURSE, DOCTOR can access)
            if (['ADMIN', 'NURSE', 'DOCTOR'].includes(user?.role || '')) {
                try {
                    const opdRes = await fetch('http://localhost:3000/api/opd/queue', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (opdRes.ok) {
                        const opd = await opdRes.json();
                        newStats.opdQueue = opd.length;
                    }
                } catch (error) {
                    console.error('Failed to fetch OPD queue', error);
                }
            }

            // Fetch lab orders (ADMIN, LAB_TECH, DOCTOR can access)
            if (['ADMIN', 'LAB_TECH', 'DOCTOR'].includes(user?.role || '')) {
                try {
                    const labRes = await fetch('http://localhost:3000/api/lab/orders', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (labRes.ok) {
                        const labs = await labRes.json();
                        newStats.pendingLabs = labs.length;
                    }
                } catch (error) {
                    console.error('Failed to fetch lab orders', error);
                }
            }

            setStats(newStats);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

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
                {user?.role === 'SUPER_ADMIN' ? (
                    <SuperAdminDashboard />
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Patients</h3>
                                <p className="text-3xl font-bold text-blue-600">{stats.patients}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">OPD Queue</h3>
                                <p className="text-3xl font-bold text-green-600">{stats.opdQueue}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Pending Labs</h3>
                                <p className="text-3xl font-bold text-purple-600">{stats.pendingLabs}</p>
                            </div>
                        </div>

                        {user?.role === 'ADMIN' && (
                            <>
                                <UserManagement />
                                <Reports />
                            </>
                        )}
                        {(user?.role === 'NURSE' || user?.role === 'ADMIN') && <PatientRegistration />}
                        {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && <OPDQueue />}
                        {(user?.role === 'LAB_TECH' || user?.role === 'ADMIN') && <LabDashboard />}
                        {(user?.role === 'PHARMACIST' || user?.role === 'ADMIN') && <PharmacyDashboard />}
                        {(user?.role === 'NURSE' || user?.role === 'ADMIN') && <BedManagement />}
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
