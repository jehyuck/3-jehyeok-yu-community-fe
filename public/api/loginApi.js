import { authClient, publicClient } from "./apiClient.js";
import { deleteAccessToken, saveToken } from "./sessionStorage.js";

export const login = async (body) =>
  publicClient.post("/auth", body, { credentials: "include" });

export const logout = () =>
  authClient.del("/auth").then((res) => {
    deleteAccessToken();
    window.location.href = "/login";
  });

export const signin = (body) => publicClient.post("/users", body);
