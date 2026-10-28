import checkIcon from "@/assets/icons/yes.svg";

import styles from "./index.module.scss";

interface Props {
  label: string;
  isChecked: boolean;
  onChange: () => void;
  mb?: number;
}

const Checkbox = ({ label, isChecked, onChange, mb }: Props) => {
  const handleCheckboxClick = () => {
    onChange();
  };

  return (
    <div
      className={styles.checkboxContainer}
      onClick={handleCheckboxClick}
      style={{
        marginBottom: mb,
      }}
    >
      <div className={`${styles.checkbox} ${isChecked ? styles.checked : ""}`}>
        {isChecked && (
          <img src={checkIcon} alt="Checked" className={styles.checkIcon} />
        )}
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default Checkbox;
