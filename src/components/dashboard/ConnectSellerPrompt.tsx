// Full-page onboarding shown to a DragonRestock user who has zero
// connected Amazon Seller Central accounts. Nothing else on the
// dashboard is relevant until they connect — no tabs, no Available
// Data card, no marketing chrome — because the whole product
// (restock planning off real sales history) requires SP-API access.
//
// This is also the screen the paid funnel is judged on: connecting is
// what fires `connect_amazon`, the bot-proof conversion every campaign
// optimises toward. `sign_up` alone is bot-contaminated.
//
// Once at least one SP-API connection lands, Dashboard.tsx switches
// to the full tabbed layout.

import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useBrand } from "@ballisticbrands/frontend-shared";
import { ConnectAmazonButton } from "./ConnectionButtons";

export function ConnectSellerPrompt({ onConnected }: { onConnected: () => void }) {
  const brand = useBrand();
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Connect your Amazon Seller Central account</CardTitle>
          <CardDescription className="mt-2">
            {brand.displayName} needs read access to your Seller Central
            account via Amazon's official SP-API to learn your sales
            velocity, lead times and inventory, and build your restock
            plan from them. Read-only. Two minutes to connect.
          </CardDescription>
        </CardHeader>
        <CardBody className="flex justify-center">
          <ConnectAmazonButton
            label="Connect Amazon Seller Central account"
            onConnected={() => {
              // No activation event here — onConnected() leads to the
              // dashboard's refresh + reconcileConnectionActivations(),
              // which fires from server state rather than the droppable
              // OAuth postMessage.
              onConnected();
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
