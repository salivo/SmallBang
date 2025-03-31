import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.PB_HOST);

export default pb;
