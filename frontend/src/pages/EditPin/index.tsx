import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import NotFound from "@/components/NotFound";
import Pin from "@/components/Pin";
import Loader from "@/components/UI/Loader";

import { usePin } from "@/hooks/api/pin";

const EditPin = () => {
  const { t } = useTranslation();

  const { lat, lng } = useParams<{ lat: string; lng: string }>();
  const { data: pin, isLoading } = usePin({
    lat: parseFloat(lat ?? ""),
    lng: parseFloat(lng ?? ""),
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!pin) return <NotFound message={t("pin-not-found")} />;

  return <Pin pin={pin} />;
};

export default EditPin;
