import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router-dom";

import BlockUpload from "@/components/BlockUpload";
import ButtonEdit from "@/components/ButtonEdit";
import NotFound from "@/components/NotFound";
import Loader from "@/components/UI/Loader";

import { useShortById } from "@/hooks/api/short";
import { useShorts } from "@/hooks/api/shorts";

import { HousingConditionType } from "@/types";

import FormattedText from "@ui/FormattedText";
import Header from "@ui/Header";
import ShortCards from "@ui/ShortCards";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import styles from "./index.module.scss";

const Article = () => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const housingCondition = (searchParams.get("housingCondition") ??
    "") as HousingConditionType;
  const postCode = searchParams.get("postCode") ?? "";

  const [shorts, isLoading] = useShorts({ housingCondition, postCode });
  const { id } = useParams<{ id: string }>();

  const [short, isLoadingShort] = useShortById(id!);

  const filteredShorts = shorts.filter((s) => s._id !== id);
  const threeShorts = filteredShorts.slice(0, 3);

  if (isLoading || isLoadingShort) {
    return <Loader />;
  }

  if (!short) {
    return <NotFound message={t("article-not-found")} />;
  }

  const sortedShorts = [...threeShorts].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <Wrapper>
      <Header showUpload btnType="primary" doubleBtnType="secondary" />
      <div className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          <img
            src={short.image.blobUrl}
            alt={short.title}
            className={styles.image}
          />
          {id && <ButtonEdit id={id} />}
        </div>
      </div>
      <div className={styles.info}>
        <Typography as="h1" className={styles.title}>
          {short.title}
        </Typography>
        <div className={styles.message}>
          <FormattedText text={short.message} />
        </div>
      </div>
      <div className={styles.divider}>
        <BlockUpload pageType="singleArticle" />
      </div>
      <Typography as="h6" className={styles.readMore}>
        {t("read-more")}
      </Typography>
      <div className={styles.cards}>
        <ShortCards shorts={sortedShorts} />
      </div>
    </Wrapper>
  );
};

export default Article;
