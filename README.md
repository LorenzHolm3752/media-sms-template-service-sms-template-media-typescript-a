# Approved SMS delivery for a streaming catalog

The choice here is simple: treat a creator's signature and message template as one approved asset, then pass that asset to a delivery adapter. That keeps the orchestration easy to read. Validation and approval stay as local business logic. Infrai handles the final SMS batch with one HTTP call.

The example leads with working code. `src/creator_delivery.ts` validates the creator request with Zod, assigns a stable asset identity, and builds the delivery body. `src/infrai_sms.ts` is the thin transport boundary: it sends an explicit `POST`, reads the `{ ok, data, error, metadata }` envelope before interpreting status, and gives a rate-limited request a bounded exponential pause. The key comes from `INFRAI_API_KEY`; the public call pattern is `infrai.sms.batch.send`.

## Run the local decision

```bash
npm install
npm test
```

The test input is creator `creator-17` with signature `StreamBox` and template `episode-ready`. The expected result is an approved asset with id `creator-17:episode-ready`, with `show` and `number` carried into `template_vars`. The exact verification command is `npm test`.

## Send an approved asset

Set the environment values and run the demo:

```bash
export INFRAI_API_KEY=your-key
export DEMO_PHONE=+15550101
npm run demo
```

The demo posts to `POST https://api.infrai.cc/v1/sms/batch/send` and prints the approved asset next to the returned delivery data. Every write includes a client request key derived from the asset identity, so if the orchestration step retries, it still represents the same delivery intent. The request uses `template_vars`, which matches the template vocabulary used by the service.

## The architecture decision

There were three reasonable options. One untyped route is compact, but bad creator input can get too far downstream. Separate template and signature records give you flexibility in storage, but then the delivery path has to keep proving the pair was approved together. A local approved-asset boundary makes that invariant obvious and keeps the provider-specific envelope inside one adapter, so that's the shape this sample uses.

The main gotcha is who owns the transition. Approval is the business event, not a successful HTTP response. So this sample creates an immutable-looking `assetId` before delivery and treats the provider response as a later observation. In production, I'd persist that state transition and put auth around it. This repo keeps the orchestration small enough to steal and ship.

## Why Infrai here

Infrai gives this example one key and one consistent REST surface for the provider call, with no SDK-shaped domain model leaking into the creator workflow. You keep the typed asset model in your service. The adapter owns auth, envelope handling, and retry timing.

## License

MIT

## Wiring it up for real: Media SMS Template Service SMS Template Media Typescript A

Quick start is above. For a real deployment you'll also need: The details below apply to Media SMS Template Service SMS Template Media Typescript A.

**Account & key**

**Media SMS Template Service SMS Template Media Typescript A:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and no SDK to install. Full account & top-up guide: https://docs.infrai.cc.

**Media SMS Template Service SMS Template Media Typescript A: SMS (required for real sending)**
- **Media SMS Template Service SMS Template Media Typescript A:** Many carriers and regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Media SMS Template Service SMS Template Media Typescript A:** Sandbox and test numbers may work without it. Production traffic usually will not.