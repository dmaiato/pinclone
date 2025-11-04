import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { userHydration } from './middlewares/userHydration.js';
import { requestLogger } from './middlewares/logging.js';
import { notFoundHandler } from './middlewares/errorHandler.js';
import publicRoutes from './routes/publicRoutes.js'
import privateRoutes from './routes/privateRoutes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(session({
    secret: '33-max-verstappen',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

app.use(requestLogger);
app.use(userHydration);

app.use('/', publicRoutes); 
app.use('/', privateRoutes);

app.use(notFoundHandler);

export default app;