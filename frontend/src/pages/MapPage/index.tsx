import EVMap from "@/components/EnerViMap/EVMap";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";

const MapPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className={styles.mapContainer}>
      <EVMap showSwitcher />
      <button className={styles.closeButton} onClick={handleClose}>
        &#x2715;
      </button>
    </div>
  );
};

export default MapPage;
