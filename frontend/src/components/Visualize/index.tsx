import { useTranslation } from "react-i18next";

import Slider from "@ui/Slider";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";
import { useScenarios } from "@/utils/constants";

import styles from "./index.module.scss";

const Visualize = () => {
  const { t } = useTranslation();
  const scenarios = useScenarios();

  return (
    <Wrapper>
      <Typography as="h3" textAlign="center" className={styles.title}>
        {t("visualizing-with-enervi-scenarios")}
      </Typography>
      <Typography className={styles.description} textAlign="center">
        {t("select-a-scenario-and-see-the-transformation")}
      </Typography>
      <Slider choices={scenarios} />
    </Wrapper>
  );
};

export default Visualize;
