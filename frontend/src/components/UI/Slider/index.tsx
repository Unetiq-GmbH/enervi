import { useState } from "react";

import { Scenario } from "@/types";
import Button from "@ui/Button";

import styles from "./index.module.scss";

interface Props {
  choices: Scenario[];
}

const Slider = ({ choices }: Props) => {
  const [selectedChoice, setSelectedChoice] = useState(
    choices.find((choice) => choice.isSelected) || choices[0]
  );

  const handleChoiceClick = (choice: Scenario) => {
    setSelectedChoice(choice);
  };

  return (
    <div className={styles.container}>
      <img
        src={selectedChoice.image}
        alt={selectedChoice.label}
        loading="lazy"
        className={styles.image}
      />

      <div className={styles.buttonsContainer}>
        {choices.map((choice) => (
          <Button
            key={choice.value}
            typeButton={
              choice.value === selectedChoice.value ? "primary" : "tertiary"
            }
            onClick={() => handleChoiceClick(choice)}
          >
            {choice.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Slider;
