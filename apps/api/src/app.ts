import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/errorHandler';
import routes from './routes/index';
import passport from 'passport';
import './config/passport';
import authRouter from './routes/auth';

const app = express();

const allowedOrigin = process.env.WEB_APP_ORIGIN || 'http://localhost:3000';
const PORT = process.env.PORT || 3001;
app.use(helmet());
app.use(morgan('combined'));
app.use(
  cors({
    origin: allowedOrigin,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorMiddleware);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj: any, done) => {
  done(obj, null);
});

app.use('/api/auth', authRouter);
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
