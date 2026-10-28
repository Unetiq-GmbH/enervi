import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BlockUpload from "@/components/BlockUpload";
import FirtsArticle from "@/components/FirtsArticle";
import NotFound from "@/components/NotFound";

import Button from "@ui/Button";
import ShortCards from "@ui/ShortCards";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import { useShorts } from "@/hooks/api/shorts";
import { HousingConditionType } from "@/types";

import styles from "./index.module.scss";
import Loader from "@/components/UI/Loader";

const Articles = () => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const housingCondition = (searchParams.get("housingCondition") ??
    "") as HousingConditionType;
  const postCode = searchParams.get("postCode") ?? "";

  const [shorts, isLoading] = useShorts({ housingCondition, postCode });

  const { user } = useAuth0();

  const navigate = useNavigate();

  const onAdd = () => {
    navigate("/create-article");
  };

  const isArticles = shorts.length > 0;

  if (isLoading) {
    return <Loader />;
  }

  const sortedShorts = [...shorts].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <>
      {!isArticles && <NotFound message={t("no-articles-found")} />}
      {isArticles && (
        <>
          <FirtsArticle short={sortedShorts[0]} />
          <Wrapper>
            <div className={styles.container}>
              <div className={styles.info}>
                <Typography as={"h3"} fontWeight={600} mb="8px">
                  {t("articles")}
                </Typography>
                <Typography>
                  {t("learn-everything-about-energy-transitions")}
                </Typography>
              </div>
              {user && (
                <Button typeButton="secondary" onClick={onAdd}>
                  {t("add-new-article")}
                </Button>
              )}
            </div>
            <ShortCards shorts={sortedShorts} />
          </Wrapper>
        </>
      )}
      <BlockUpload pageType="articles" />
    </>
  );
};

export default Articles;
