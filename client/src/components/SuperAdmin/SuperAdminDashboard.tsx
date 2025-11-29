import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface PHC {
    id: string;
    name: string;
    address: string;
    contactNumber: string;
    licenseNumber: string;
    adminEmail: string;
    status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
    schemaName: string;
    createdAt: string;
    updatedAt: string;
}

const SuperAdminDashboard: React.FC = () => {
    const { token } = useAuth();
    const [phcs, setPHCs] = useState<PHC[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contactNumber: '',
        licenseNumber: '',
        adminEmail: '',
        adminName: '',
        adminPassword: ''
    });

    useEffect(() => {
        fetchPHCs();
    }, []);

    const fetchPHCs = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/superadmin/phc', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPHCs(data);
            }
        } catch (error) {
            console.error('Failed to fetch PHCs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePHC = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/superadmin/phc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('PHC created successfully!');
                setShowCreateForm(false);
                setFormData({
                    name: '',
                    address: '',
                    contactNumber: '',
                    licenseNumber: '',
                    adminEmail: '',
                    adminName: '',
                    adminPassword: ''
                });
                fetchPHCs();
            } else {
                const error = await response.json();
                alert(`Failed to create PHC: ${error.error}`);
            }
        } catch (error) {
            console.error('Failed to create PHC:', error);
            alert('Failed to create PHC');
        }
    };

    const handleStatusChange = async (phcId: string, newStatus: string, currentStatus: string) => {
        try {
            let adminPassword = '';

            // If activating a PHC, prompt for admin password
            if (newStatus === 'ACTIVE' && currentStatus !== 'ACTIVE') {
                adminPassword = prompt('Enter admin password for this PHC:') || '';
                if (!adminPassword) {
                    alert('Admin password is required to activate a PHC');
                    return;
                }
            }

            const response = await fetch(`http://localhost:3000/api/superadmin/phc/${phcId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, adminPassword })
            });

            if (response.ok) {
                alert('PHC status updated successfully!');
                fetchPHCs();
            } else {
                const error = await response.json();
                alert(`Failed to update status: ${error.error}`);
            }
        } catch (error) {
            console.error('Failed to update PHC status:', error);
            alert('Failed to update PHC status');
        }
    };

    const stats = {
        total: phcs.length,
        active: phcs.filter(p => p.status === 'ACTIVE').length,
        pending: phcs.filter(p => p.status === 'PENDING').length,
        suspended: phcs.filter(p => p.status === 'SUSPENDED').length
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'VERIFIED': return 'bg-blue-100 text-blue-800';
            case 'SUSPENDED': return 'bg-red-100 text-red-800';
            case 'INACTIVE': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">PHC Management</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {showCreateForm ? 'Cancel' : 'Create New PHC'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total PHCs</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Active</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Suspended</h3>
                    <p className="text-3xl font-bold text-red-600">{stats.suspended}</p>
                </div>
            </div>

            {/* Create PHC Form */}
            {showCreateForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h3 className="text-xl font-bold mb-4">Create New PHC</h3>
                    <form onSubmit={handleCreatePHC} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">PHC Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">License Number</label>
                            <input
                                type="text"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Number</label>
                            <input
                                type="text"
                                value={formData.contactNumber}
                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Admin Email</label>
                            <input
                                type="email"
                                value={formData.adminEmail}
                                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Admin Name</label>
                            <input
                                type="text"
                                value={formData.adminName}
                                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Admin Password</label>
                            <input
                                type="password"
                                value={formData.adminPassword}
                                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Create PHC
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* PHC List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {phcs.map((phc) => (
                            <tr key={phc.id}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{phc.name}</div>
                                    <div className="text-sm text-gray-500">{phc.address}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{phc.licenseNumber}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{phc.contactNumber}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(phc.status)}`}>
                                        {phc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <select
                                        value={phc.status}
                                        onChange={(e) => handleStatusChange(phc.id, e.target.value)}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="VERIFIED">VERIFIED</option>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="SUSPENDED">SUSPENDED</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
