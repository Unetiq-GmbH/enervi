import { useContext } from "react";

import UserContext from "@/contexts/UserContext";
import { useScenarios, useScenariosForLogged } from "@/utils/constants";
import ScenarioCard from "@ui/ScenarioCard";
import styles from "./index.module.scss";
import { useTranslation } from "react-i18next";

interface Props {
  selectedCardValue: string | null;
  onCardClick: (id: string) => void;
}

const ScenarioCards = ({ selectedCardValue, onCardClick }: Props) => {
  const { t } = useTranslation();

  const { user } = useContext(UserContext);
  const scenarios = useScenarios();
  const scenariosForLogged = useScenariosForLogged();

  const curScenarios = user
    ? [...scenarios, ...scenariosForLogged]
    : [...scenarios];

  const selectedScenario = scenarios.find(s => s.value === selectedCardValue);

  return (
    <>
      <div className={styles.cardContainer}>
        {curScenarios.map((scenario, index) => {
          const isOdd = scenarios.length % 2 !== 0;
          return (
            <div
              key={scenario.label}
              className={`${styles.card} ${isOdd && index === scenarios.length - 1 ? styles.lastCard : ""}`}
            >
              <ScenarioCard
                card={scenario}
                isDimmed={selectedCardValue !== null && selectedCardValue !== scenario.value}
                onClick={() => onCardClick(scenario.value)}
              />
            </div>
          );
        })}
      </div>
      <div className={styles.infoBox}>
        <div>{t("main-disclaimer")}</div>
        {selectedScenario && selectedScenario.disclaimer && (
          <div>{selectedScenario.disclaimer}</div>
        )}
      </div>
    </>
  );
};

export default ScenarioCards;
