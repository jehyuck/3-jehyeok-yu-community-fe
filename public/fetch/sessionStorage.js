const ACCESS_KEY = "AT";

export const saveToken = (t) => {
  if (t) sessionStorage.setItem(ACCESS_KEY, t);
  else sessionStorage.removeItem(ACCESS_KEY);
};

export const getAccessToken = () => {
  try {
    const v = sessionStorage.getItem(ACCESS_KEY);
    if (!v || v === "null" || v === "undefined") return null;
    return v;
  } catch {
    return null;
  }
};

export const deleteAccessToken = () => {
  sessionStorage.removeItem(ACCESS_KEY);
};
