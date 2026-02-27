import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Routes
import authRoutes from './routes/authRoutes';
import memberRoutes from './routes/memberRoutes';
import applicationRoutes from './routes/applicationRoutes';
import accountsRoutes from './routes/accountsRoutes';
import eventsRoutes from './routes/eventsRoutes';
import jobsRoutes from './routes/jobsRoutes';
import adminRoutes from './routes/adminRoutes';
import publicRoutes from './routes/publicRoutes';
import idCardRoutes from './routes/idCardRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory (built React app)
app.use(express.static(path.join(__dirname, '../public')));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/id-card', idCardRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'VARA Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API info
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'VARA UAE API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      members: '/api/members',
      applications: '/api/applications',
      accounts: '/api/accounts',
      events: '/api/events',
      jobs: '/api/jobs',
      admin: '/api/admin',
      public: '/api/public',
   SPA Fallback: Serve React app for all non-API routes
app.get('*', (req: Request, res: Response) => {
  // Don't fall back for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.path,
    });
  }
  // Serve index.html for React Router
  res.sendFile(path.join(__dirname, '../public/index.html').use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  // Server started
});

export default app;
