import { useMutation } from "@tanstack/react-query";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import Drop from "@/components/Drop";
import UserContext from "@/contexts/UserContext";

import { getCoordinatesFromOpenStreetMap } from "@/service/openStreetMap.service";
import { deleteShort, postShort } from "@/service/short.service";

import Button from "@ui/Button";
import Checkbox from "@ui/Checkbox";
import Header from "@ui/Header";
import Input from "@ui/Input";
import Modal from "@ui/Modal";
import Textarea from "@ui/Textarea";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import { QueryKey } from "@/enums/QueryKey";
import { PinFormValues, PinLocation, Short } from "@/types";
import { getPinFormInitialValues } from "@/utils/pin";
import { queryClient } from "@/utils/queryClient";

import EVMap from "../EnerViMap/EVMap";
import styles from "./index.module.scss";
import { useTranslation } from "react-i18next";

interface Props {
  isEditing?: boolean;
  initialData?: Short;
}

type LatLng = {
  lat: string | number;
  lng: string | number;
};

const ArticleForm = ({ isEditing = false, initialData }: Props) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [formData, setFormData] = useState({
    _id: initialData?._id ?? "",
    image: initialData?.image ?? { blobUrl: "", path: "" },
    title: initialData?.title ?? "",
    message: initialData?.message ?? "",
    pin: getPinFormInitialValues(initialData?.pin || null),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPinEnabled, setIsPinEnabled] = useState(!!initialData?.pin);
  const [imageSrc, setImageSrc] = useState(initialData?.image?.blobUrl ?? "");
  const [uploadedImage, setUploadedImage] = useState<File>();
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: handleShortDelete } = useMutation({
    mutationFn: deleteShort,
    onSuccess: (_, id) => {
      queryClient.setQueryData([QueryKey.Shorts], (oldShorts: Short[]) =>
        oldShorts.filter((s: Short) => s._id !== id)
      );
      navigate("/articles");
    },
  });

  const { mutate: addArticle } = useMutation({
    mutationFn: postShort,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.Shorts] });
      navigate("/articles");
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = t("title-is-required");
    if (!formData.message) newErrors.message = t("message-is-required");
    if (!uploadedImage && !imageSrc) newErrors.image = t("image-is-required");
    if (isPinEnabled) {
      if (!formData.pin.address.street)
        newErrors.street = t("street-is-required");
      if (!formData.pin.address.postCode)
        newErrors.postCode = t("post-code-is-required");
      if (!formData.pin.address.city) newErrors.city = t("city-is-required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = new FormData();

    let pinData: PinFormValues | null = null;
    if (isPinEnabled) {
      let coordinates: LatLng = { lat: "", lng: "" };
      const fullAddress = `${formData.pin.address.street} ${formData.pin.address.city} ${formData.pin.address.postCode}`;

      if (showManualCoords) {
        coordinates = formData.pin.latlng;
      } else {
        try {
          const geoResponse =
            await getCoordinatesFromOpenStreetMap(fullAddress);
          if (geoResponse.data.length === 0) {
            setShowManualCoords(true);
            return;
          }
          coordinates = {
            lat: geoResponse.data[0].lat,
            lng: geoResponse.data[0].lon,
          };
        } catch (error) {
          setShowManualCoords(true);
          return;
        }
      }

      pinData = {
        ...formData.pin,
        latlng: coordinates,
        creator: user,
      };
    }

    submitData.append("_id", formData._id);
    submitData.append("title", formData.title);
    submitData.append("message", formData.message);
    submitData.append("image", imageSrc ? JSON.stringify(formData.image) : "");
    submitData.append("uploadedImage", uploadedImage ?? "");
    submitData.append("pin", pinData ? JSON.stringify(pinData) : "");

    addArticle(submitData);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("pin.address.")) {
      const field = name.split(".")[2];
      setFormData((prev) => ({
        ...prev,
        pin: {
          ...prev.pin,
          address: {
            ...prev.pin.address,
            [field]: value,
          },
        },
      }));
    } else if (name.startsWith("pin.latlng.")) {
      const field = name.split(".")[2];
      setFormData((prev) => ({
        ...prev,
        pin: {
          ...prev.pin,
          latlng: {
            ...prev.pin.latlng,
            [field]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleLocationSelect = (locationData: PinLocation) => {
    setFormData((prev) => ({
      ...prev,
      pin: {
        ...prev.pin,
        address: {
          ...prev.pin.address,
          street: locationData.address.street,
          city: locationData.address.city,
          postCode: locationData.address.postCode,
        },
      },
    }));
  };

  return (
    <Wrapper>
      <Header doubleBtnType="secondary" />
      <div className={styles.container}>
        <Typography as={"h4"} className={styles.title}>
          {isEditing ? t("edit-article") : t("add-new-article")}
        </Typography>

        <form onSubmit={handleSubmit}>
          <div className={styles.drop}>
            <Drop
              imageSrc={imageSrc}
              setImage={setUploadedImage}
              setImageSrc={setImageSrc}
              centerButton
            />
            {errors.image && (
              <Typography className={styles.error}>{errors.image}</Typography>
            )}
          </div>
          <div className={styles.wrapper}>
            <Input
              name="title"
              label={t("title")}
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder={t("enter-title")}
            />

            <Textarea
              name="message"
              label={t("description")}
              value={formData.message}
              onChange={handleInputChange}
              required
              placeholder={t("enter-description")}
            />

            <Checkbox
              label={t("add-to-map")}
              isChecked={isPinEnabled}
              onChange={() => setIsPinEnabled(!isPinEnabled)}
            />

            {isPinEnabled && (
              <>
                <Input
                  name="pin.address.street"
                  label={t("street")}
                  value={formData.pin.address.street}
                  onChange={handleInputChange}
                  placeholder={t("enter-street")}
                  required
                />
                <Input
                  name="pin.address.postCode"
                  label={t("post-code")}
                  value={formData.pin.address.postCode}
                  onChange={handleInputChange}
                  placeholder={t("enter-post-code")}
                  required
                />
                <Input
                  name="pin.address.city"
                  label={t("city")}
                  value={formData.pin.address.city}
                  onChange={handleInputChange}
                  placeholder={t("enter-city")}
                  required
                />

                {showManualCoords && (
                  <>
                    <Input
                      name="pin.latlng.lat"
                      label={t("latitude")}
                      value={formData.pin.latlng.lat}
                      onChange={handleInputChange}
                      placeholder={t("latitude")}
                      required
                    />
                    <Input
                      name="pin.latlng.lng"
                      label={t("longitude")}
                      value={formData.pin.latlng.lng}
                      onChange={handleInputChange}
                      placeholder={t("longitude")}
                      required
                    />
                  </>
                )}

                <div className={styles.mapContainer}>
                  <EVMap onSelectLocation={handleLocationSelect} />
                </div>
              </>
            )}

            <div className={styles.bnts}>
              {isEditing ? (
                <Button
                  type="button"
                  typeButton="error"
                  onClick={() => setIsModalOpen(true)}
                >
                  {t("delete-article")}
                </Button>
              ) : (
                <div />
              )}

              <div className={styles.btsRight}>
                <Button
                  typeButton="cancel"
                  onClick={() => navigate("/articles")}
                >
                  {t("cancel")}
                </Button>
                <Button typeButton="primary" type="submit">
                  {isEditing ? t("save") : t("add-article")}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {isEditing && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              if (formData._id) {
                handleShortDelete(formData._id);
              }
              setIsModalOpen(false);
            }}
            message={t("are-you-sure-you-want-to-remove-this-article")}
            errorButtonText={t("delete-article")}
          />
        )}
      </div>
    </Wrapper>
  );
};

export default ArticleForm;
