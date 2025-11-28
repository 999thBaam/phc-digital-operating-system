import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import patientRoutes from './routes/patients';
import opdRoutes from './routes/opd';
import labRoutes from './routes/lab';
import pharmacyRoutes from './routes/pharmacy';
import bedRoutes from './routes/beds';
import { authenticateToken, requireRole } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateToken, requireRole(['ADMIN']), adminRoutes);
app.use('/api/patients', authenticateToken, requireRole(['ADMIN', 'NURSE', 'DOCTOR']), patientRoutes);
app.use('/api/opd', authenticateToken, requireRole(['ADMIN', 'NURSE', 'DOCTOR']), opdRoutes);
app.use('/api/lab', authenticateToken, requireRole(['ADMIN', 'LAB_TECH', 'DOCTOR']), labRoutes);
app.use('/api/pharmacy', authenticateToken, requireRole(['ADMIN', 'PHARMACIST']), pharmacyRoutes);
app.use('/api/beds', authenticateToken, requireRole(['ADMIN', 'NURSE', 'DOCTOR']), bedRoutes);

app.get('/', (req, res) => {
    res.send('PHC DOS API is running');
});

export default app;
