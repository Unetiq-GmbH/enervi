import { useState } from "react";

import styles from "./index.module.scss";
import { Scenario } from "@/types";
import { useTranslation } from "react-i18next";

type Props = {
  label: string;
  options: Scenario[];
  onSelect: (value: string) => void;
  defaultValue: string;
};

const DropdownSelectScenario = ({
  label,
  options,
  onSelect,
  defaultValue,
}: Props) => {
  const { t } = useTranslation();

  const isValidDefaultValue =
    defaultValue && options.some((option) => option.value === defaultValue);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(
    isValidDefaultValue ? defaultValue : null
  );

  const handleToggle = () => setIsOpen(!isOpen);
  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className={styles.select} onClick={handleToggle}>
        {selectedValue
          ? options.find((option) => option.value === selectedValue)?.label
          : t("select")}
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          {options.map((option) => (
            <div
              key={option.value}
              className={styles.option}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownSelectScenario;
