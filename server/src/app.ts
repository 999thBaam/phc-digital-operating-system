import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import patientRoutes from './routes/patients';
import opdRoutes from './routes/opd';
import labRoutes from './routes/lab';
import pharmacyRoutes from './routes/pharmacy';
import bedRoutes from './routes/beds';
import { authenticateToken } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/patients', authenticateToken, patientRoutes);
app.use('/api/opd', authenticateToken, opdRoutes);
app.use('/api/lab', authenticateToken, labRoutes);
app.use('/api/pharmacy', authenticateToken, pharmacyRoutes);
app.use('/api/beds', authenticateToken, bedRoutes);

app.get('/', (req, res) => {
    res.send('PHC DOS API is running');
});

export default app;
