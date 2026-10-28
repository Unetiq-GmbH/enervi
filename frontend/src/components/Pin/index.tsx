import { OutputBlockData } from "@editorjs/editorjs";
import { FormEvent, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import UserContext from "@/contexts/UserContext";
import { QueryKey } from "@/enums/QueryKey";

import { getCoordinatesFromOpenStreetMap } from "@/service/openStreetMap.service";
import { deletePin, postPin } from "@/service/pin.service";

import { Coordinates, Pin as PinType } from "@/types";

import { getPinFormInitialValues } from "@/utils/pin";
import { queryClient } from "@/utils/queryClient";

import Header from "@ui/Header";
import Modal from "@ui/Modal";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import PinForm from "./PinForm";
import styles from "./index.module.scss";

interface PinProps {
  pin?: PinType;
}

const Pin = ({ pin }: PinProps) => {
  const { t } = useTranslation();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string>("");

  const initialValues = getPinFormInitialValues(pin || null);
  const [formData, setFormData] = useState({
    title: initialValues.name,
    description:
      initialValues.description?.blocks
        .filter((block) => block.type === "paragraph")
        .map((block) => block.data.text)
        .join(" ") ?? "",
    street: initialValues.address.street,
    postCode: initialValues.address.postCode,
    city: initialValues.address.city,
    coordinates: {
      lat: pin?.latlng.lat ?? 0,
      lng: pin?.latlng.lng ?? 0,
    },
    imageBlocks:
      initialValues.description?.blocks.filter(
        (block) => block.type === "image"
      ) || [],
    markerIconType: initialValues.markerIconType,
  });

  const [showManualCoords, setShowManualCoords] = useState<boolean>(false);

  const handleChange = (field: string, value: string | Coordinates) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleAddImage = (image: OutputBlockData) => {
    setFormData((prev) => ({
      ...prev,
      imageBlocks: [...prev.imageBlocks, image],
    }));
  };

  const handleDeleteImage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      imageBlocks: prev.imageBlocks.filter((block) => block.id !== id),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.imageBlocks.length === 0) {
      setError(t("image-is-required"));
      return;
    }

    const fullAddress = `${formData.street} ${formData.city} ${formData.postCode}`;

    let updatedCoordinates = formData.coordinates;

    if (!showManualCoords) {
      try {
        const geoResponse = await getCoordinatesFromOpenStreetMap(fullAddress);

        if (geoResponse.data.length === 0) {
          setShowManualCoords(true);
          return;
        }

        updatedCoordinates = {
          lat: geoResponse.data[0].lat,
          lng: geoResponse.data[0].lon,
        };

        setFormData((prev) => ({
          ...prev,
          coordinates: updatedCoordinates,
        }));
      } catch (error) {
        setShowManualCoords(true);
        return;
      }
    }

    if (user) {
      const descriptionBlocks = [
        ...formData.imageBlocks.filter((block) => block.type === "image"),
        {
          id: Date.now().toString(),
          type: "paragraph",
          data: { text: formData.description },
        },
      ];

      const values = {
        _id: pin?._id ?? null,
        name: formData.title,
        latlng: updatedCoordinates,
        address: {
          _id: pin?.address?._id ?? null,
          street: formData.street,
          postCode: formData.postCode,
          city: formData.city,
        },
        creator: user,
        description: {
          time: Date.now(),
          blocks: descriptionBlocks,
          version: "2.29.1",
        },
        markerIconType: formData.markerIconType ?? "default",
      };

      handlePostPin(values as PinType);
    }
  };

  const { mutate: handlePostPin } = useMutation({
    mutationFn: postPin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.Pins] });
      navigate("/pins");
    },
  });

  const { mutate: handlePinDelete } = useMutation({
    mutationFn: deletePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.Pins] });
      setIsModalOpen(false);
      navigate("/pins");
    },
  });

  const handleUpdateImageCaption = (imageId: string, newCaption: string) => {
    setFormData((prevData) => ({
      ...prevData,
      imageBlocks: prevData.imageBlocks.map((block) => {
        if (block.id === imageId && block.type === "image") {
          return {
            ...block,
            data: {
              ...block.data,
              caption: newCaption,
            },
          };
        }
        return block;
      }),
    }));
  };

  return (
    <Wrapper>
      <Header doubleBtnType="secondary" />
      <div className={styles.container}>
        <Typography as="h4" className={styles.title}>
          {pin ? t("edit-pin") : t("add-pin")}
        </Typography>

        <PinForm
          formData={formData}
          handleAddImage={handleAddImage}
          handleDeleteImage={handleDeleteImage}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setIsModalOpen={setIsModalOpen}
          handleUpdateImageCaption={handleUpdateImageCaption}
          showManualCoords={showManualCoords}
          pin={pin}
          error={error}
        />

        {pin && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              handlePinDelete(pin._id ?? "");
              setIsModalOpen(false);
            }}
            message={t("are-you-sure-you-want-to-remove-pin")}
            errorButtonText={t("remove-pin")}
          />
        )}
      </div>
    </Wrapper>
  );
};

export default Pin;
