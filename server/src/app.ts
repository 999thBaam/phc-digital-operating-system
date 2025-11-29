/// <reference path="./types/express.d.ts" />
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import patientRoutes from './routes/patients';
import opdRoutes from './routes/opd';
import labRoutes from './routes/lab';
import pharmacyRoutes from './routes/pharmacy';
import bedRoutes from './routes/beds';
import reportRoutes from './routes/reports';
import { authenticateToken, requireRole } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
import superAdminRoutes from './routes/superadmin';
import { tenantMiddleware } from './middleware/tenant';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', authenticateToken, requireRole(['SUPER_ADMIN']), superAdminRoutes);

// Tenant Routes (Apply tenantMiddleware)
app.use('/api/admin', authenticateToken, tenantMiddleware, requireRole(['ADMIN']), adminRoutes);
app.use('/api/patients', authenticateToken, tenantMiddleware, requireRole(['ADMIN', 'NURSE', 'DOCTOR']), patientRoutes);
app.use('/api/opd', authenticateToken, tenantMiddleware, requireRole(['ADMIN', 'NURSE', 'DOCTOR']), opdRoutes);
app.use('/api/lab', authenticateToken, tenantMiddleware, requireRole(['ADMIN', 'LAB_TECH', 'DOCTOR']), labRoutes);
app.use('/api/pharmacy', authenticateToken, tenantMiddleware, requireRole(['ADMIN', 'PHARMACIST']), pharmacyRoutes);
app.use('/api/beds', authenticateToken, tenantMiddleware, requireRole(['ADMIN', 'NURSE', 'DOCTOR']), bedRoutes);
app.use('/api/reports', authenticateToken, tenantMiddleware, reportRoutes);

app.get('/', (req, res) => {
    res.send('PHC DOS API is running');
});

export default app;
