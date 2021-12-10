import * as modulesType from "./module.d.ts";
import express, { Express, Router, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import compression from 'compression';
import Package, { version, latestUpdate } from './package.json';
import corsConfig from './configs/cors';

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
const FirebaseServiceAccount = JSON.parse((process.env.FIREBASE_SERVICE_ACCOUNT as string)) || throwError("Invalid Firebase Service Account not found");

import { ethers } from 'ethers';
import keccak from 'keccak';

export function throwError(error: any) {
  throw error
}

initializeApp({ credential: cert(FirebaseServiceAccount) });

const db = getFirestore();


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

router.all("/user/get-wallet", getWalletHandler);
router.post("/user/create-wallet", createWalletHandler);
app.use(router);


async function getWalletHandler(req: Request, res: Response) {
  const userID = req.body.userID || throwError("Must include a valid ser ID")
  if (!userID) return res.send(null)
  
  const data_ = await firestoreGetLINEUserWallet(userID)
  if (!data_) return res.send()
  return res.json({ address: data_?.wallet?.address })
}

async function firestoreGetLINEUserWallet(LINEUserId: string) {
  try {
    if (!LINEUserId) return {}
    const { user_id } =  ((await db.collection('user_id_link:line').doc(LINEUserId).get()).data() as any)

    if (!user_id) {
      return {}
    }
    const doc = await db.collection('user:wallet').doc(user_id).get()
    
    return { ...doc.data() || {} }
  } catch (error) {
    console.error(error);
    return {}
  }
}
}



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
