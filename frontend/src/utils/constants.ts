import solar from "@/assets/scenarios/Solar.jpg";
import wind from "@/assets/scenarios/Wind.jpg";
import customPromptImage from "@/assets/scenarios/custom-prompt.jpg";
import flood from "@/assets/scenarios/flood.jpg";
import fluxWind from "@/assets/scenarios/flux_wind.jpg";
import fluxSolar from "@/assets/scenarios/flux_solar.jpg";
import fluxFree from "@/assets/scenarios/flux_free.jpg";

import wind200 from "@/assets/scenarios/200/Wind.jpg";
import solar200 from "@/assets/scenarios/200/Solar.jpg";
import noClimateProtection200 from "@/assets/scenarios/200/NoClimateProtection.jpg";
import greeningAndDesealing200 from "@/assets/scenarios/200/GreeningAndDesealing.jpg";
import sealing200 from "@/assets/scenarios/200/Sealing.jpg";
import alternativeTransportation200 from "@/assets/scenarios/200/AlternativeTransportation.jpg";
import drought200 from "@/assets/scenarios/200/Drought.jpg";
import customPromptImage200 from "@/assets/scenarios/200/custom-prompt.jpg";
import flood200 from "@/assets/scenarios/200/flood.jpg";
import fluxWind200 from "@/assets/scenarios/200/flux_wind.jpg";
import fluxSolar200 from "@/assets/scenarios/200/flux_solar.jpg";
import fluxFree200 from "@/assets/scenarios/200/flux_free.jpg";

import { Scenario as ScenariosType } from "@/types";
import { useTranslation } from "react-i18next";

export const COOKIE_ENERGY_CALCULATOR_OPENED_FROM =
  "energyCalculatorResultsOpenedFromScenarioInProcess";

export const useScenarios = (): ScenariosType[] => {
  const { t } = useTranslation();

  return [
    {
      value: "solar",
      label: t("scenarios.solar"),
      image: solar,
      smallImage: solar200,
      disclaimer: t("solar-disclaimer"),
    },
    {
      value: "wind",
      label: t("scenarios.wind"),
      image: wind,
      smallImage: wind200,
      disclaimer: t("wind-disclaimer"),
    },
    {
      value: "no-climate-protection",
      label: t("scenarios.no-climate-protection"),
      image: noClimateProtection200,
      smallImage: noClimateProtection200,
      disclaimer: t("no-climate-protection-disclaimer"),
    },
    {
      value: "greening-and-de-sealing",
      label: t("scenarios.greening-and-de-sealing"),
      image: greeningAndDesealing200,
      smallImage: greeningAndDesealing200,
      disclaimer: t("greening-and-de-sealing-disclaimer"),
    },
    {
      value: "sealing",
      label: t("scenarios.sealing"),
      image: sealing200,
      smallImage: sealing200,
      disclaimer: t("sealing-disclaimer"),
    },
    {
      value: "alternative-transportation",
      label: t("scenarios.alternative-transportation"),
      image: alternativeTransportation200,
      smallImage: alternativeTransportation200,
      disclaimer: t("alternative-transportation-disclaimer"),
    },
    {
      value: "flood",
      label: t("flood"),
      image: flood,
      smallImage: flood200,
      disclaimer: t("flood-disclaimer"),
    },
    {
      value: "drought",
      label: t("scenarios.drought"),
      image: drought200,
      smallImage: drought200,
      disclaimer: t("drought-disclaimer"),
    },
  ];
};

export const useScenariosForLogged = (): ScenariosType[] => {
  const { t } = useTranslation();

  return [
    {
      value: "flux_free",
      label: t("flux-api-free"),
      image: fluxFree,
      smallImage: fluxFree200,
      disclaimer: "",
    },
    {
      value: "custom_prompt",
      label: t("custom-prompt"),
      image: customPromptImage,
      smallImage: customPromptImage200,
      disclaimer: "",
    },
  ];
};
export const useFluxScenario = (): ScenariosType[] => {
  const { t } = useTranslation();

  return [
    {
      value: "flux_wind",
      label: t("wind-version-2"),
      image: fluxWind,
      smallImage: fluxWind200,
      disclaimer: "",
    },
    {
      value: "flux_solar",
      label: t("solar-version-2"),
      image: fluxSolar,
      smallImage: fluxSolar200,
      disclaimer: "",
    },
  ];
};
