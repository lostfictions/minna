import path from "path";

import express from "express";
import PouchDB from "pouchdb";

const dbPath = path.join(__dirname, "../db/");

const Pouch = PouchDB.defaults(
  {
    prefix: dbPath
  } as any /* HACK: bad typings */
);

const PORT = 3001;

const app = express();
app.use(
  "/db",
  require("express-pouchdb")(Pouch, { logPath: path.join(dbPath, "log.txt") })
);

app.listen(PORT);
