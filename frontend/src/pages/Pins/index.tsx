import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import EVMap from "@/components/EnerViMap/EVMap";
import PinCard from "@/components/PinCard";
import Loader from "@/components/UI/Loader";

import Button from "@ui/Button";
import Header from "@ui/Header";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import { usePins } from "@/hooks/api/pins";

import styles from "./index.module.scss";
import { useEffect } from "react";

const Pins = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [pins, isLoadingPin] = usePins();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoadingPin) {
    return <Loader />;
  }

  return (
    <Wrapper>
      <Header doubleBtnType="secondary" />
      <div className={styles.container}>
        <div className={styles.manage}>
          <Typography as="h4" bold>
            {t("manage-pins")}{" "}
          </Typography>
          <Button onClick={() => navigate("/create-pin")}>
            {t("add-new-pin")}
          </Button>
        </div>

        <div className={styles.wrapper}>
          <div className={styles.pins}>
            {pins.map((pin) => {
              const imageUrl =
                pin.description?.blocks.find((block) => block.type === "image")
                  ?.data.file.url || "";

              const firstShort =
                pin.shorts && pin.shorts.length > 0 ? pin.shorts[0] : null;

              if (firstShort) {
                return (
                  <PinCard
                    key={firstShort._id ?? `${pin._id}-${firstShort.title}`}
                    imageUrl={firstShort.image.blobUrl}
                    title={firstShort.title}
                    latlng={pin.latlng}
                  />
                );
              }

              return (
                <PinCard
                  key={pin._id}
                  imageUrl={imageUrl}
                  title={pin.name}
                  latlng={pin.latlng}
                />
              );
            })}
          </div>
          <div className={styles.mapContainer}>
            <EVMap />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Pins;
