import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ButtonEdit from "@/components/ButtonEdit";
import { Short } from "@/types";
import Typography from "@ui/Typography";

import ArticleModal from "../ArticleModal";
import styles from "./index.module.scss";

type Props = {
  short: Short;
  openInModal?: boolean;
};

const ShortCard = ({ short, openInModal = false }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleClick = () => {
    if (openInModal) {
      handleOpenModal();
    } else {
      navigate(`/articles/${short._id}`);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.image}>
          <img src={short.image.blobUrl} alt={short.image.blobName} />
        </div>
        <div className={styles.content}>
          <Typography as="h6" className={styles.title} onClick={handleClick}>
            {short.title}
          </Typography>
          <Typography className={styles.message} onClick={handleClick}>
            {short.message}
          </Typography>
          <Typography className={styles.link} onClick={handleClick}>
            {t("read-more")}
          </Typography>
        </div>
        {short._id && <ButtonEdit id={short._id} />}
      </div>
      {isModalOpen && (
        <ArticleModal
          isOpen={isModalOpen}
          short={short}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ShortCard;
