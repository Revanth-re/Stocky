"use client";
import { useState } from "react";
import type { StoreType } from "@/db/schema";
import type { StoreInfoInput, StockEntryInput } from "@/validators/onboarding";
import { useCompleteOnboarding } from "../api/use-onboarding";
import { OnboardingStepper } from "./onboarding-stepper";
import { StepStoreInfo } from "./step-store-info";
import { StepStoreType } from "./step-store-type";
import { StepBrandSelect } from "./step-brand-select";
import { StepCatalogPreview } from "./step-catalog-preview";
import { StepStockEntry } from "./step-stock-entry";

type WizardState = {
  step: number;
  storeInfo: StoreInfoInput;
  storeType?: StoreType;
  brandSlugs: string[];
};

const EMPTY_STORE_INFO: StoreInfoInput = {
  storeName: "",
  ownerName: "",
  phone: "",
  gstNumber: "",
  address: "",
};

export function OnboardingWizard() {
  const [state, setState] = useState<WizardState>({
    step: 1,
    storeInfo: EMPTY_STORE_INFO,
    brandSlugs: [],
  });
  const completeOnboarding = useCompleteOnboarding();

  return (
    <div className="mx-auto w-full max-w-3xl py-10">
      <OnboardingStepper currentStep={state.step} />

      {state.step === 1 && (
        <StepStoreInfo
          defaultValues={state.storeInfo}
          onNext={(storeInfo) => setState((s) => ({ ...s, storeInfo, step: 2 }))}
        />
      )}

      {state.step === 2 && (
        <StepStoreType
          defaultValue={state.storeType}
          onBack={() => setState((s) => ({ ...s, step: 1 }))}
          onNext={(storeType) => setState((s) => ({ ...s, storeType, step: 3 }))}
        />
      )}

      {state.step === 3 && (
        <StepBrandSelect
          defaultValue={state.brandSlugs}
          onBack={() => setState((s) => ({ ...s, step: 2 }))}
          onNext={(brandSlugs) => setState((s) => ({ ...s, brandSlugs, step: 4 }))}
        />
      )}

      {state.step === 4 && (
        <StepCatalogPreview
          brandSlugs={state.brandSlugs}
          onBack={() => setState((s) => ({ ...s, step: 3 }))}
          onNext={() => setState((s) => ({ ...s, step: 5 }))}
        />
      )}

      {state.step === 5 && state.storeType && (
        <StepStockEntry
          brandSlugs={state.brandSlugs}
          onBack={() => setState((s) => ({ ...s, step: 4 }))}
          submitting={completeOnboarding.isPending}
          onSubmit={(values: StockEntryInput) =>
            completeOnboarding.mutate({
              storeInfo: state.storeInfo,
              storeType: state.storeType!,
              brandSlugs: state.brandSlugs,
              stock: values.rows,
            })
          }
        />
      )}
    </div>
  );
}
