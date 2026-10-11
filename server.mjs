import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const app = express();
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
app.disable('x-powered-by');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(3000, '0.0.0.0', () => console.log('Sunny Farm listening on 0.0.0.0:3000'));
