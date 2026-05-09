import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from "./src/routes/auth.routes.js"
import cookieParser from 'cookie-parser';

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
app.use("/api/v1/auth", authRoutes);


// catch-all route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
