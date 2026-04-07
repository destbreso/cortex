import { MongoClient, Document } from "mongodb";

const uri =
  process.env.DATABASE_URL ?? "mongodb://localhost:27017/ollama_interface";

const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };

export const mongoClient = globalForMongo.mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production")
  globalForMongo.mongoClient = mongoClient;

export const getDb = () => mongoClient.db();

/** Normaliza _id → id para mantener la forma de respuesta de la API */
export function toDoc(doc: Document): Record<string, unknown> {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}
