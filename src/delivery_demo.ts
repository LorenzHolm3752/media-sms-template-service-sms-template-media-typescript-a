import { approveCreatorAsset, deliveryBody } from "./creator_delivery.js";
import { infrai } from "./infrai_sms.js";

const asset = approveCreatorAsset({
  creatorId: "creator-17",
  signature: "StreamBox",
  templateName: "episode-ready",
  templateText: "{{show}} episode {{number}} is ready to watch.",
  variables: ["show", "number"],
});

const phone = process.env.DEMO_PHONE;
if (!phone) throw new Error("DEMO_PHONE is required");

const result = await infrai.sms.batch.send(deliveryBody(asset, phone), asset.assetId);
console.log({ asset, result });
