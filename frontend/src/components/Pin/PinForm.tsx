import { useNavigate } from "react-router-dom";
import { OutputBlockData } from "@editorjs/editorjs";

import EVMap from "@/components/EnerViMap/EVMap";
import PinImageBlock from "@/components/PinImageBlock";

import { Coordinates, Pin, PinLocation } from "@/types";

import Button from "@ui/Button";
import Input from "@ui/Input";
import Textarea from "@ui/Textarea";
import Typography from "@ui/Typography";

import styles from "./index.module.scss";
import markerIconOptions from "../EnerViMap/utils/MarkerIconOptions";
import DropdownSelectPin from "../DropdownSelectPin";
import { useTranslation } from "react-i18next";

interface Props {
  formData: {
    title: string;
    description: string;
    street: string;
    postCode: string;
    city: string;
    coordinates: Coordinates;
    imageBlocks: OutputBlockData[];
    markerIconType: string;
  };
  handleAddImage: (image: OutputBlockData) => void;
  handleDeleteImage: (id: string) => void;
  handleChange: (
    field: keyof Props["formData"],
    value: string | Coordinates
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setIsModalOpen: (value: boolean) => void;
  handleUpdateImageCaption: (imageId: string, newCaption: string) => void;
  showManualCoords: boolean;
  pin?: Pin;
  error?: string;
}

const PinForm = ({
  formData,
  handleAddImage,
  handleDeleteImage,
  handleChange,
  handleSubmit,
  setIsModalOpen,
  handleUpdateImageCaption,
  showManualCoords,
  pin,
  error,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const renderInput = (
    name: keyof Props["formData"],
    label: string,
    placeholder: string,
    required = false
  ) => (
    <Input
      name={name}
      label={label}
      value={formData[name] as string}
      required={required}
      placeholder={placeholder}
      onChange={(e) => handleChange(name, e.target.value)}
    />
  );

  const handleLocationSelect = (locationData: PinLocation) => {
    handleChange("coordinates", locationData.latlng);
    handleChange("street", locationData.address?.street || "");
    handleChange("city", locationData.address?.city || "");
    handleChange("postCode", locationData.address?.postCode || "");
  };

  const selectMarkerIcon = (value: string) =>
    handleChange("markerIconType", value);

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.wrapper}>
        <div className={styles.wrapperTitle}>
          {renderInput("title", t("title"), t("enter-title"), true)}
          <DropdownSelectPin
            options={markerIconOptions}
            onSelect={selectMarkerIcon}
            defaultValue={formData.markerIconType}
          />
        </div>

        <Textarea
          name="description"
          label={t("description")}
          value={formData.description}
          required
          placeholder={t("enter-description")}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <div className={styles.images}>
          <PinImageBlock
            blocks={formData.imageBlocks}
            onImageAdd={handleAddImage}
            onImageDelete={handleDeleteImage}
            onUpdateCaption={handleUpdateImageCaption}
          />
          {error && <Typography className={styles.error}>{error}</Typography>}
        </div>

        {renderInput("street", t("street"), t("enter-street"), true)}
        {renderInput("postCode", t("post-code"), t("enter-post-code"), true)}
        {renderInput("city", t("city"), t("enter-city"), true)}

        {showManualCoords && (
          <>
            <Input
              name="lat"
              label={t("latitude")}
              value={formData.coordinates.lat}
              onChange={(e) =>
                handleChange("coordinates", {
                  ...formData.coordinates,
                  lat: +e.target.value,
                })
              }
              placeholder={t("enter-latitude")}
            />
            <Input
              name="lng"
              label={t("longitude")}
              value={formData.coordinates.lng}
              onChange={(e) =>
                handleChange("coordinates", {
                  ...formData.coordinates,
                  lng: +e.target.value,
                })
              }
              placeholder={t("enter-longitude")}
            />
          </>
        )}

        <div className={styles.mapContainer}>
          <EVMap onSelectLocation={handleLocationSelect} />
        </div>

        <div className={styles.bnts}>
          {pin && (
            <Button
              type="button"
              typeButton="error"
              onClick={() => setIsModalOpen(true)}
            >
              {t("remove-pin")}
            </Button>
          )}
          <div className={styles.btsRight}>
            <Button typeButton="cancel" onClick={() => navigate("/pins")}>
              {t("cancel")}
            </Button>
            <Button typeButton="primary" type="submit">
              {pin ? t("save") : t("add-pin")}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PinForm;
