import { authClient, publicClient } from "./apiClient.js";
import { deleteAccessToken, saveToken } from "./sessionStorage.js";

export const login = async (body) => {
  const res = await publicClient.post("/auth", body, {
    credentials: "include",
  });
  const data = await res.json();
  const auth = data.data.accessToken;
  if (auth !== undefined) saveToken(auth);
};

export const logout = () =>
  authClient.del("/auth").then((res) => {
    deleteAccessToken();
    window.location.href = "/login";
  });

export const signin = (body) => publicClient.post("/users", body);
