import api from "./index";

const GPU_VISUALIZATION_URL = `${import.meta.env.VITE_REACT_APP_GPU_URL}`;

export const manipulateImage = async (
  visualizationType: string,
  image: { image: string }
) => {
  const checkStatus = await api.get(`${GPU_VISUALIZATION_URL}/check_status`);
  if (checkStatus.status === 200) {
    const body = { image: image.image, visualizationType };
    const res = await api.post(`${GPU_VISUALIZATION_URL}/visualize`, body);
    return res.data;
  }
};
