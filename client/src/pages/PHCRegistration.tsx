import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PHCRegistration: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contactNumber: '',
        licenseNumber: '',
        adminEmail: '',
        adminName: '',
        adminPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.adminPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/register-phc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    address: formData.address,
                    contactNumber: formData.contactNumber,
                    licenseNumber: formData.licenseNumber,
                    adminEmail: formData.adminEmail,
                    adminName: formData.adminName,
                    adminPassword: formData.adminPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
                    <div className="mb-4 text-green-600">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Application Submitted!</h2>
                    <p className="text-gray-600 mb-4">
                        Your PHC registration application has been submitted successfully.
                    </p>
                    <p className="text-sm text-gray-500">
                        Our team will review your application and notify you via email once approved.
                        You will be redirected to the login page shortly...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-2 text-center text-blue-600">PHC Registration</h2>
                <p className="text-center text-gray-600 mb-6">Apply to join the PHC Digital Operating System</p>

                {error && <p className="text-red-500 mb-4 text-sm text-center bg-red-50 p-3 rounded">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">PHC Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Address *</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Contact Number *</label>
                            <input
                                type="tel"
                                value={formData.contactNumber}
                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">License Number *</label>
                            <input
                                type="text"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="col-span-2 border-t pt-4 mt-2">
                            <h3 className="font-semibold text-gray-700 mb-3">Admin Account Details</h3>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Admin Name *</label>
                            <input
                                type="text"
                                value={formData.adminName}
                                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Admin Email *</label>
                            <input
                                type="email"
                                value={formData.adminEmail}
                                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Password *</label>
                            <input
                                type="password"
                                value={formData.adminPassword}
                                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password *</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 mt-6"
                    >
                        Submit Application
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Already registered? Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PHCRegistration;
