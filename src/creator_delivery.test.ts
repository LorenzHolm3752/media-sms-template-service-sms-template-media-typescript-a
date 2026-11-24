import assert from "node:assert/strict";
import { approveCreatorAsset, deliveryBody } from "./creator_delivery.js";

const asset = approveCreatorAsset({
  creatorId: "creator-17",
  signature: "StreamBox",
  templateName: "episode-ready",
  templateText: "{{show}} episode {{number}} is ready to watch.",
  variables: ["show", "number"],
});

assert.equal(asset.state, "approved");
assert.equal(asset.assetId, "creator-17:episode-ready");
assert.deepEqual(deliveryBody(asset, "+15550101").messages[0].template_vars, {
  show: "show",
  number: "number",
});
assert.throws(() => approveCreatorAsset({ creatorId: "creator-17" }));
console.log("creator approval decision: passed");
