"use client";
import { useState } from "react";
import type { BusinessTemplate } from "@/db/schema";
import type { StoreInfoInput, StockEntryInput } from "@/validators/onboarding";
import { hasSeededCatalog } from "@/business/registry";
import { useCompleteOnboarding } from "../api/use-onboarding";
import { OnboardingStepper } from "./onboarding-stepper";
import { StepStoreInfo } from "./step-store-info";
import { StepBusinessTemplate } from "./step-business-template";
import { StepBrandSelect } from "./step-brand-select";
import { StepCatalogPreview } from "./step-catalog-preview";
import { StepStockEntry } from "./step-stock-entry";

type WizardState = {
  step: number;
  storeInfo: StoreInfoInput;
  businessTemplate?: BusinessTemplate;
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

  const storeHasSeededCatalog = state.businessTemplate ? hasSeededCatalog(state.businessTemplate) : false;

  return (
    <div className="mx-auto w-full max-w-3xl py-10">
      <OnboardingStepper currentStep={state.step} totalSteps={storeHasSeededCatalog ? 5 : 2} />

      {state.step === 1 && (
        <StepStoreInfo
          defaultValues={state.storeInfo}
          onNext={(storeInfo) => setState((s) => ({ ...s, storeInfo, step: 2 }))}
        />
      )}

      {state.step === 2 && (
        <StepBusinessTemplate
          defaultValue={state.businessTemplate}
          onBack={() => setState((s) => ({ ...s, step: 1 }))}
          onNext={(businessTemplate) => {
            if (hasSeededCatalog(businessTemplate)) {
              setState((s) => ({ ...s, businessTemplate, step: 3 }));
            } else {
              completeOnboarding.mutate({
                storeInfo: state.storeInfo,
                businessTemplate,
                brandSlugs: [],
                stock: [],
              });
            }
          }}
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

      {state.step === 5 && state.businessTemplate && (
        <StepStockEntry
          brandSlugs={state.brandSlugs}
          onBack={() => setState((s) => ({ ...s, step: 4 }))}
          submitting={completeOnboarding.isPending}
          onSubmit={(values: StockEntryInput) =>
            completeOnboarding.mutate({
              storeInfo: state.storeInfo,
              businessTemplate: state.businessTemplate!,
              brandSlugs: state.brandSlugs,
              stock: values.rows,
            })
          }
        />
      )}
    </div>
  );
}
