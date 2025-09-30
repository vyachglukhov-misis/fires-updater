import { Db, MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const url = process.env.MONGO_URI || '';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;

  if (!client) {
    client = new MongoClient(url);
    await client.connect();
    console.log('Connected to mongodb. Db name:');
  }
  db = client.db();
  return db;
}

export async function disconnectDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Successfully disconnected');
  }
}
