import * as modulesType from "./module.d.ts";
import express, { Express, Router, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import compression from 'compression';
import Package, { version, latestUpdate } from './package.json';
import corsConfig from './configs/cors';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

app.use(compression());
app.use(cors(corsConfig([`http://localhost:${PORT}`])));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



/* 
  Core Routes
*/

app.all('/', cors(), healthcheckHandler);

function healthcheckHandler(req: Request, res: Response) {
  const client = { "user-agent": req.headers?.['user-agent'], "origin": req.headers?.origin }
  if (req.method === "POST" && req.body.full) {
    return res.json({ ...Package, client });
  }
  return res.json({ version, latestUpdate, client });
}


/* 
  Application Routes
*/

const router: Router = express.Router();

app.use(router);




app.listen(PORT, () => {
  const now = new Date();
  console.log(`
  =============================
    App version ${version}
    ⚡Starting at 🕰️  ${now.toUTCString()} (${now.toISOString()})
    ${Intl.DateTimeFormat().resolvedOptions().timeZone}
    ⚡Using port ${PORT}
  =============================`
  )
});
