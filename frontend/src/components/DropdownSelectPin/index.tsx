import { useState } from "react";
import { useTranslation } from "react-i18next";

import { MarkerIconOption } from "@/types";

import styles from "./index.module.scss";

type Props = {
  options: MarkerIconOption[];
  onSelect: (value: string) => void;
  defaultValue: string;
};

const DropdownSelectPin = ({ options, onSelect, defaultValue }: Props) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(
    defaultValue || null
  );

  const handleToggle = () => setIsOpen(!isOpen);
  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.select} onClick={handleToggle}>
        {selectedValue ? (
          <img
            src={
              options.find((option) => option.value === selectedValue)?.iconUrl
            }
            alt={t("selected-icon")}
            className={styles.icon}
          />
        ) : (
          t("select")
        )}
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          {options.map((option) => (
            <div
              key={option.value}
              className={styles.option}
              onClick={() => handleSelect(option.value)}
            >
              <img
                src={option.iconUrl}
                alt={option.value}
                className={styles.icon}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownSelectPin;
