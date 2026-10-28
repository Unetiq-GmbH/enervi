import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BerlinIcon from "@/assets/cities/berlin-icon.jpg";
import NeuerkirchIcon from "@/assets/cities/neuerkirch-icon.jpg";
import ExternalLink from "@/assets/icons/external-link.svg";

import Button from "@ui/Button";

import styles from "./index.module.scss";

interface City {
  name: string;
  icon: string;
}

const cities: City[] = [
  { name: "Berlin", icon: BerlinIcon },
  { name: "Neuerkirch", icon: NeuerkirchIcon },
];

interface Props {
  onChange: (city: string) => void;
}

const CitySwitcher = ({ onChange }: Props) => {
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState<string>("Berlin");

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    onChange(city);
  };

  const isMapPage = window.location.pathname === "/map";

  return (
    <>
      <div
        className={styles.switcher + (isMapPage ? " " + styles.mapPage : "")}
      >
        {cities.map((city) => (
          <div
            key={city.name}
            className={`${styles.city} ${selectedCity === city.name ? styles.selected : ""}`}
            onClick={() => handleCityChange(city.name)}
          >
            <img src={city.icon} alt={city.name} className={styles.icon} />
            <span>{city.name}</span>
          </div>
        ))}
      </div>
      {!isMapPage && (
        <div className={styles.buttonContainer}>
          <Button
            typeButton="tertiary"
            icon={ExternalLink}
            sx={{ padding: "10.5px 12px" }}
            onClick={() => navigate("/map")}
          >
            Karte öffnen
          </Button>
        </div>
      )}
    </>
  );
};

export default CitySwitcher;
