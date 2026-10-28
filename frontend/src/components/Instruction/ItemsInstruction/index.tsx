import { useTranslation } from "react-i18next";
import ItemInstruction from "../ItemInstruction";
import styles from "./index.module.scss";

const ItemsInstruction = () => {
  const { t } = useTranslation();

  const itemsData = [
    {
      number: 1,
      title: t("upload-your-image"),
      description: t(
        "start-by-uploading-an-image-this-could-be-a-location-facility-or-any-relevant-subject"
      ),
    },
    {
      number: 2,
      title: t("select-scenario"),
      description: t(
        "choose-from-a-variety-of-scenarios-such-as-wind-solar-flood-drought"
      ),
    },
    {
      number: 3,
      title: t("get-your-result"),
      description: t(
        "watch-as-our-ai-powered-visualization-tool-displays-the-generated-result"
      ),
    },
  ];

  return (
    <div className={styles.items}>
      {itemsData.map((item) => (
        <ItemInstruction
          key={item.number}
          number={item.number}
          title={item.title}
          description={item.description}
        />
      ))}
    </div>
  );
};

export default ItemsInstruction;
