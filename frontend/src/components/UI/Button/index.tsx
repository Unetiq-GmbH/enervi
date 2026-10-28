import { ButtonHTMLAttributes, forwardRef, CSSProperties } from "react";

import styles from "./index.module.scss";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  typeButton?: "primary" | "secondary" | "tertiary" | "error" | "cancel";
  icon?: string;
  iconPosition?: "left" | "right";
  sx?: CSSProperties;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      typeButton = "primary",
      children,
      icon,
      iconPosition = "left",
      sx,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`${styles.button} ${styles[typeButton]}`}
        style={sx}
        {...props}
      >
        {icon && iconPosition === "left" && (
          <img src={icon} alt="icon" className={styles.icon} />
        )}
        {children}
        {icon && iconPosition === "right" && (
          <img src={icon} alt="icon" className={styles.icon} />
        )}
      </button>
    );
  }
);

export default Button;
