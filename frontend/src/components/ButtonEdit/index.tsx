import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

import EditIcon from "@ui/Icons/EditIcon";

import styles from "./index.module.scss";

interface Props {
  id: string;
}

const ButtonEdit = ({ id }: Props) => {
  const { user } = useAuth0();

  const navigate = useNavigate();

  const onEdit = () => {
    navigate("/edit-article/" + id);
  };

  if (!user) {
    return null;
  }

  return (
    <button className={styles.editIcon} onClick={onEdit}>
      <EditIcon />
    </button>
  );
};

export default ButtonEdit;
