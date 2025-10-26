import { BASE_URL } from "./config.js";
import { deleteAccessToken, getAccessToken } from "./sessionStorage.js";
const redirectLoading = false;

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

async function baseFetch(path, opt = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(opt.headers || {}),
  };

  try {
    const res = await fetch(BASE_URL + path, { ...opt, headers });

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
async function authFetch(path, opt = {}) {
  // const token = getAccessToken();
  const headers = {
    ...(opt.headers || {}),
  };

  try {
    const res = await baseFetch(path, {
      ...opt,
      credentials: "include",
      headers,
    });

    if (res.status === 401 && !redirectLoading) {
      redirectLoading = true;
      alert("로그인이 필요합니다.");
      window.location.href = "/login";
    }

    return res;
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
