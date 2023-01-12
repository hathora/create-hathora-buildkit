import { register } from "@hathora/server-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const coordinator = await register({
  appSecret: process.env.APP_SECRET!,
  authInfo: { anonymous: { separator: "-" } },
  store: {
    newState(roomId, userId, data) {
      console.log("newState", roomId.toString(36), userId);
    },
    subscribeUser(roomId, userId) {
      console.log("subscribeUser", roomId.toString(36), userId);
    },
    unsubscribeUser(roomId, userId) {
      console.log("unsubscribeUser", roomId.toString(36), userId);
    },
    onMessage(roomId, userId, data) {
      const dataBuf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
      console.log("onMessage", roomId.toString(36), userId, dataBuf.toString("utf8"));
      coordinator.sendMessage(roomId, userId, dataBuf);
    },
  },
});

console.log(`Connected to ${coordinator.host} with storeId ${coordinator.storeId}`);
