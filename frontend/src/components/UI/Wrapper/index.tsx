import { HTMLAttributes, ReactNode } from "react";
import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

const Wrapper = ({ children, ...props }: Props) => {
  return (
    <section className={styles.wrapper} {...props}>
      {children}
    </section>
  );
};

export default Wrapper;
