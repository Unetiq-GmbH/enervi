import { useNavigate } from "react-router-dom";

import Button from "@ui/Button";
import Header from "@ui/Header";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import { Short } from "@/types";

import styles from "./index.module.scss";
import { useTranslation } from "react-i18next";

interface Props {
  short: Short;
}

const FirtsArticle = ({ short }: Props) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { _id, image, title, message } = short ?? {};

  const onButtonClick = () => {
    navigate(`/articles/${_id}`);
  };

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${image.blobUrl})`,
        backgroundSize: "cover",
      }}
    >
      <Wrapper>
        <Header btnType="primary" showUpload />
        <div className={styles.content}>
          <Typography as={"h1"} className={styles.title}>
            {title}
          </Typography>
          <Typography className={styles.description}>{message}</Typography>
          <Button onClick={onButtonClick}>{t("read-article")}</Button>
        </div>
      </Wrapper>
    </div>
  );
};

export default FirtsArticle;
