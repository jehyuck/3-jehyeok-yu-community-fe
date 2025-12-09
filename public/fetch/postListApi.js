import { authClient } from "./apiClient.js";

export const getPostlist = async (path) => {
  const res = await authClient.get(path);
  const data = await res.json();
  return data.data;
};
