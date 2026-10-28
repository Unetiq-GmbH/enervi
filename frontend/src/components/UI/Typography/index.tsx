import { forwardRef, ElementType, CSSProperties, HTMLAttributes } from "react";
import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  bold?: boolean;
  color?: string;
  sx?: CSSProperties;
  fontSize?: string;
  textAlign?: "left" | "center" | "right";
  mb?: string;
  fontWeight?: number | string;
}

const Typography = forwardRef<HTMLElement, Props>(
  (
    {
      as: Component = "p",
      bold = false,
      color,
      sx,
      fontSize,
      textAlign,
      mb,
      fontWeight,
      children,
      ...props
    },
    ref
  ) => {
    const textColor = color ?? styles.defaultColor;
    const classNames = `${styles.typography} ${
      bold ? styles.bold : styles.normal
    }`;

    return (
      <Component
        ref={ref}
        style={{
          color: textColor,
          fontSize,
          textAlign,
          marginBottom: mb,
          fontWeight,
          ...sx,
        }}
        className={classNames}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

export default Typography;
