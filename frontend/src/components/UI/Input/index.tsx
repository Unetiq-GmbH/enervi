import { forwardRef, InputHTMLAttributes } from "react";
import styles from "./index.module.scss";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  label: string;
  placeholder: string;
  mb?: number;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ type = "text", label, placeholder, mb = 0, ...rest }, ref) => {
    return (
      <div style={{ marginBottom: mb }}>
        <label className={styles.label}>{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          className={styles.input}
          ref={ref}
          {...rest}
        />
      </div>
    );
  }
);

export default Input;
