import "./style.css";
import { HathoraClient } from "@hathora/client-sdk";

const serverOut = document.getElementById("server-out")!;
const txtAppId = document.getElementById("txt-app-id")!;
const outputPanel = document.querySelector(".output-panel")!;

txtAppId.innerHTML = `Your app's unique ID is ${process.env.APP_ID}`;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const client = new HathoraClient(process.env.APP_ID!);
const token = await client.loginAnonymous();
const roomId = await client.create(token, new Uint8Array());
const connection = await client.connect(token, roomId, onMessage, onError);

connection.write(encoder.encode("Hello Hathora!"));

function onMessage(msg: ArrayBuffer) {
  const msgStr = decoder.decode(msg);

  if (msgStr === "Hello Hathora!") {
    outputPanel.classList.add("connected");
    serverOut.innerHTML = `${msgStr}`;
  }
}

function onError(error: any) {
  console.error(error);
}
