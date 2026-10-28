import { useNavigate } from "react-router-dom";

import downIcon from "@/assets/icons/mingcute_down-line.svg";
import Typography from "@ui/Typography";

import noImage from "@/assets/no_image.png";
import styles from "./index.module.scss";

interface Props {
  imageUrl: string;
  title: string;
  latlng: { lat: number; lng: number };
}

const PinCard = ({ imageUrl, title, latlng }: Props) => {
  const { lat, lng } = latlng;
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/edit-pin/${lat}/${lng}`);
  };

  const imageSrc = imageUrl || noImage;

  return (
    <div className={styles.pinCard} onClick={handleClick}>
      <img src={imageSrc} alt={title} className={styles.image} />
      <Typography className={styles.title}>{title}</Typography>
      <img src={downIcon} alt="icon" className={styles.icon} />
    </div>
  );
};

export default PinCard;
