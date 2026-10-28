import { ChangeEvent } from "react";
import { OutputBlockData } from "@editorjs/editorjs";
import { useTranslation } from "react-i18next";

import { uploadImageToServerFromEditor } from "@/service/image.service";
import Typography from "@ui/Typography";
import Button from "@ui/Button";

import PinImageItem from "./PinImageItem";
import styles from "./index.module.scss";

interface Props {
  blocks: OutputBlockData[];
  onImageAdd: (image: OutputBlockData) => void;
  onImageDelete: (id: string) => void;
  onUpdateCaption: (imageId: string, newCaption: string) => void;
}

const PinImageBlock = ({
  blocks,
  onImageAdd,
  onImageDelete,
  onUpdateCaption,
}: Props) => {
  const { t } = useTranslation();

  const handleDeleteImage = (id: string) => {
    onImageDelete(id);
  };

  const handleAddImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        alert(t("please-upload-an-image-file"));
        return;
      }

      try {
        const uploadedImage = await uploadImageToServerFromEditor(file);

        const newImageBlock: OutputBlockData = {
          id: `img_${Date.now()}`,
          type: "image",
          data: {
            file: { url: uploadedImage.file.url },
            caption: "",
            withBorder: false,
            stretched: false,
            withBackground: false,
          },
        };

        onImageAdd(newImageBlock);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  return (
    <div className={styles.pinImage}>
      <Typography as="h5" bold>
        {t("images")}
      </Typography>
      <div className={styles.imageList}>
        {blocks.map((block) =>
          block.type === "image" && block.data.file.url ? (
            <PinImageItem
              key={block.id}
              imageUrl={block.data.file.url}
              onDelete={() => handleDeleteImage(block.id ?? "")}
              onUpdateCaption={(newCaption) =>
                onUpdateCaption(block.id ?? "", newCaption)
              }
              caption={block.data.caption}
            />
          ) : null
        )}
      </div>
      <Button typeButton="cancel" type="button">
        <label htmlFor="file-upload" className={styles.fileUploadLabel}>
          {t("add-image")}
        </label>
      </Button>
      <input
        type="file"
        id="file-upload"
        className={styles.fileUploadInput}
        onChange={handleAddImage}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default PinImageBlock;
