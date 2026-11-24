import { z } from "zod";

export const creatorRequest = z.object({
  creatorId: z.string().min(1),
  signature: z.string().min(1),
  templateName: z.string().min(1),
  templateText: z.string().min(1),
  variables: z.array(z.string().min(1)).default([]),
});

export type CreatorRequest = z.infer<typeof creatorRequest>;

export type ApprovedAsset = CreatorRequest & {
  assetId: string;
  state: "approved";
};

export function approveCreatorAsset(input: unknown): ApprovedAsset {
  const request = creatorRequest.parse(input);
  return {
    ...request,
    assetId: `${request.creatorId}:${request.templateName}`,
    state: "approved",
  };
}

export function deliveryBody(asset: ApprovedAsset, phone: string) {
  return {
    messages: [{
      phone,
      content: asset.templateText,
      signature: asset.signature,
      template_name: asset.templateName,
      template_vars: Object.fromEntries(asset.variables.map((name) => [name, name])),
    }],
  };
}
