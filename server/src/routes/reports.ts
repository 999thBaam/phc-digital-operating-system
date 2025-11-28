import express from 'express';
import prisma from '../utils/prisma';
import { requireRole } from '../middleware/auth';

const router = express.Router();

// Helper to convert array of objects to CSV
const toCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    return [headers, ...rows].join('\n');
};

// Daily OPD List
router.get('/opd', requireRole(['ADMIN']), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const visits = await prisma.oPDVisit.findMany({
            where: {
                createdAt: {
                    gte: today
                }
            },
            include: {
                patient: true
            }
        });

        const data = visits.map(v => ({
            Token: v.tokenNo,
            PatientName: v.patient.name,
            Age: v.patient.age,
            Gender: v.patient.gender,
            Status: v.status,
            Diagnosis: v.diagnosis || 'N/A',
            Date: v.createdAt.toISOString().split('T')[0]
        }));

        res.header('Content-Type', 'text/csv');
        res.attachment(`opd_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(toCSV(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Admitted Patient List
router.get('/admissions', requireRole(['ADMIN']), async (req, res) => {
    try {
        const admissions = await prisma.admission.findMany({
            where: {
                status: 'ADMITTED'
            },
            include: {
                patient: true,
                bed: true
            }
        });

        const data = admissions.map(a => ({
            PatientName: a.patient.name,
            BedNumber: a.bed.number,
            AdmittedAt: a.admittedAt.toISOString(),
            Status: a.status
        }));

        res.header('Content-Type', 'text/csv');
        res.attachment(`admissions_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(toCSV(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Medicine Dispensed List
router.get('/pharmacy', requireRole(['ADMIN']), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const prescriptions = await prisma.prescription.findMany({
            where: {
                status: 'DISPENSED',
                updatedAt: {
                    gte: today
                }
            },
            include: {
                opdVisit: {
                    include: {
                        patient: true
                    }
                }
            }
        });

        const data = prescriptions.map(p => ({
            PatientName: p.opdVisit.patient.name,
            Medicine: p.medicine,
            Dosage: p.dosage,
            DispensedAt: p.updatedAt.toISOString()
        }));

        res.header('Content-Type', 'text/csv');
        res.attachment(`pharmacy_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(toCSV(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Lab Test Summary
router.get('/lab', requireRole(['ADMIN']), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const orders = await prisma.labOrder.findMany({
            where: {
                updatedAt: {
                    gte: today
                }
            },
            include: {
                opdVisit: {
                    include: {
                        patient: true
                    }
                }
            }
        });

        const data = orders.map(o => ({
            PatientName: o.opdVisit.patient.name,
            TestName: o.testName,
            Status: o.status,
            Result: o.result || 'Pending',
            Date: o.updatedAt.toISOString()
        }));

        res.header('Content-Type', 'text/csv');
        res.attachment(`lab_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(toCSV(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

export default router;
