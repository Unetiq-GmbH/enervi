import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";
import { useTranslation } from "react-i18next";

import ItemsInstruction from "@/components/Instruction/ItemsInstruction";
import UploadInstruction from "@components/UploadInstruction";

import styles from "./index.module.scss";

const Instruction = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <div className={styles.instructionWrapper}>
        <Typography color="#66A811" mb="12px" fontWeight={600}>
          {t("how-it-works")}
        </Typography>
        <Typography
          as={"h3"}
          className={styles.title}
          fontWeight={600}
          color="#101828"
        >
          {t("energy-transitions-visualized-with-ai")}
        </Typography>
        <Typography className={styles.description}>
          {t(
            "our-platform-offers-a-unique-ai-powered-experience-that-brings-the-countrys-energy-transition-to-life"
          )}
        </Typography>
        <div className={styles.instruction}>
          <ItemsInstruction />
          <UploadInstruction />
        </div>
      </div>
    </Wrapper>
  );
};
export default Instruction;
