import { HathoraClient } from "@hathora/client-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const client = new HathoraClient(process.env.APP_ID!);
const token = await client.loginAnonymous();
const roomId = await client.create(token, new Uint8Array());
const connection = await client.connect(token, roomId, onMessage, onError);

connection.write(encoder.encode("Hello world!"));

function onMessage(msg: ArrayBuffer) {
  console.log(decoder.decode(msg));
}

function onError(error: any) {
  console.error(error);
}
