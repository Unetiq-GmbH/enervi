import DropdownSelectScenario from "@/components/DropdownSelectScenario";
import { useScenarios } from "@/utils/constants";
import BinIcon from "@ui/Icons/BinIcon";

import styles from "./index.module.scss";

type Props = {
  imageUrl: string;
  onDelete: () => void;
  caption: string;
  onUpdateCaption: (newCaption: string) => void;
};

const PinImageItem = ({
  imageUrl,
  onDelete,
  onUpdateCaption,
  caption,
}: Props) => {
  const scenarios = useScenarios();

  return (
    <div className={styles.pinImageBlock}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt="Selected" className={styles.image} />
        <button onClick={onDelete} className={styles.deleteBtn}>
          <BinIcon size="40px" />
        </button>
      </div>
      <div className={styles.dropdownContainer}>
        <DropdownSelectScenario
          label="Scenario"
          options={scenarios}
          onSelect={(value) => onUpdateCaption(value)}
          defaultValue={caption}
        />
      </div>
    </div>
  );
};

export default PinImageItem;
