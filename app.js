import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './src/routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import jobRoutes from './src/routes/job.routes.js';
import applicationRoutes from './src/routes/application.routes.js';
import candidateRoutes from './src/routes/candidate.routes.js';
import employerRoutes from './src/routes/employer.routes.js';
import notiicationRoutes from './src/routes/notification.routes.js';

const app = express();

app.use(helmet());
app.use(cors());

// to get cookies in req
app.use(cookieParser());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/employers', employerRoutes);
app.use('/api/v1/notifications', notiicationRoutes);

// catch-all route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// global error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error' });
});

export default app;
