import {
  ChangeEvent,
  TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  placeholder: string;
  mb?: number;
  initialHeight?: number;
}

const Textarea = ({
  label,
  placeholder,
  mb = 0,
  onChange,
  initialHeight = 40,
  ...rest
}: Props) => {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState<number>(initialHeight);

  const adjustHeight = () => {
    const textarea = localRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      setHeight(textarea.scrollHeight);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    onChange?.(e);
  };

  useEffect(() => {
    adjustHeight();
  }, []);

  return (
    <div style={{ marginBottom: mb }}>
      <label className={styles.label}>{label}</label>
      <textarea
        ref={localRef}
        placeholder={placeholder}
        className={styles.textarea}
        spellCheck
        rows={1}
        style={{ height: height || initialHeight }}
        onChange={handleChange}
        {...rest}
      />
    </div>
  );
};

export default Textarea;
