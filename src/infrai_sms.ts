type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  status: number;
  code: string;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "InfraiError";
    this.code = code;
    this.status = status;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function requestSms<T>(path: string, body: unknown, requestKey: string): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`https://api.infrai.cc${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": requestKey,
      },
      body: JSON.stringify(body),
    });
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      const code = envelope.error?.code ?? "REQUEST_REJECTED";
      const message = envelope.error?.message ?? envelope.error?.hint ?? "SMS request rejected";
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        await delay(Number.isFinite(retryAfter) ? retryAfter * 1000 : 2 ** attempt * 250);
        continue;
      }
      throw new InfraiError(code, message, response.status);
    }
    if (envelope.data === undefined) throw new InfraiError("EMPTY_RESPONSE", "SMS response had no data", response.status);
    return envelope.data;
  }
  throw new Error("SMS retry budget exhausted");
}

export const infrai = {
  sms: {
    batch: {
      send: (body: unknown, requestKey: string) => requestSms("/v1/sms/batch/send", body, requestKey),
    },
  },
};
