const getGPUServerURL = (): string | undefined => {
  return process.env.NODE_ENV === "production"
    ? process.env.PROD_GPU_URL
    : process.env.DEV_GPU_URL;
};

export default getGPUServerURL;
