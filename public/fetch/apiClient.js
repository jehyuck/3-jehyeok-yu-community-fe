import { BASE_URL, IMAGE_URL } from "/config.js";
import {
  deleteAccessToken,
  getAccessToken,
  saveToken,
} from "./sessionStorage.js";

const make =
  (client, method) =>
  (path, opt = {}) =>
    client(path, { ...opt, method });

const makeWithBody =
  (client, method) =>
  (path, body, opt = {}) =>
    client(path, {
      ...opt,
      method,
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

async function baseFetch(path, opt = {}, mode = "b") {
  const headers = {
    "Content-Type": "application/json",
    ...(opt.headers || {}),
  };

  try {
    const REQUEST_URL =
      mode === "b" ? BASE_URL : mode === "m" ? IMAGE_URL : BASE_URL;
    const res = await fetch(REQUEST_URL + path, { ...opt, headers });

    if (res.status >= 500) {
      alert("서버 에러가 발생했습니다. 잠시 후 접속해주세요.");
      throw new Error();
    }
    return res;
  } catch (e) {
    throw e;
  }
}
export const publicClient = {
  fetch: (path, opt = {}) => baseFetch(path, opt),
  get: make(baseFetch, "GET"),
  post: makeWithBody(baseFetch, "POST"),
  put: makeWithBody(baseFetch, "PUT"),
  del: make(baseFetch, "DELETE"),
};

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

function refreshFaild() {
  alert("로그인이 필요합니다.");
  deleteAccessToken();
  window.location.href = "/login";
}

function makeAuth() {
  const token = getAccessToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

async function authFetch(path, opt = {}, depth = 0) {
  if (depth > 1) throw new Error("리프래시 실패");

  const token = getAccessToken();
  const headers = {
    ...makeAuth(),
    ...(opt.headers || {}),
  };

  try {
    const res = await baseFetch(path, {
      ...opt,
      credentials: "include",
      headers,
    });
    if (res.status !== 401) {
      return res;
    }
    const data = await res.json();

    if (data.error.code === "LOGIN_REQUIRED") {
      refreshFaild();
      return res;
    }

    const refreshRes = await baseFetch("/auth", {
      method: "PUT",
      credentials: "include",
    });

    if (!refreshRes.success) {
      refreshFaild();
      return res;
    }
    const refreshJson = await refreshRes.json();
    const newAccess = refreshJson?.accessToken;
    if (!newAccess) {
      refreshFaild();
      return res;
    }

    saveToken(newAccess);

    return authFetch(path, { ...opt, headers: makeAuth() }, depth + 1);
  } catch (e) {
    console.error("fetch 에러 발생:", e);
    throw e;
  }
}

export const authClient = {
  fetch: authFetch,
  get: make(authFetch, "GET"),
  post: makeWithBody(authFetch, "POST"),
  put: makeWithBody(authFetch, "PUT"),
  del: make(authFetch, "DELETE"),
};
