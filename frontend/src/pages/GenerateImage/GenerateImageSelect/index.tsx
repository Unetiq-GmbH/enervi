import { useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "./index.module.scss";

type Props = {
  label: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
};

const GenerateImageSelect = ({ label, options, onSelect }: Props) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

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

export default GenerateImageSelect;
