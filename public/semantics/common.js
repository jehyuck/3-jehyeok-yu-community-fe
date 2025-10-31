import { authClient } from "../api/apiClient.js";
import { logout } from "../api/loginApi.js";
import { getAccessToken } from "../api/sessionStorage.js";

const pages = {
  NON_AUTH: ["signin", "login"],
  AUTH: ["post-list", "post-form", "post"],
};

const HOME = "post-list";
const LOGIN = "login";

// (function () {
//   const at = getAccessToken(); // 콜백 함수로 이후 기능 구현 필요
//   const goto = (url, msg) => {
//     if (msg) alert(msg);
//     if (url === currentPath) return;
//     window.location.href = `/${url}`;
//   };

//   const currentPath = window.location.pathname.split("/")[1];
//   // const isAuth = pages.AUTH.includes(currentPath);
//   const isNon = pages.NON_AUTH.includes(currentPath);
//   if (isNon && at) goto(HOME, "로그인 된 상태입니다. 홈으로 이동합니다.");
// })();
let avatar;
let dropdown;

async function insertHeader() {
  const mount = document.getElementById("app-header");
  if (!mount || mount.firstElementChild) return;

  const res = await fetch("/semantics/header/header.html");
  if (!res.ok) return;

  const html = await res.text();
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  mount.appendChild(t.content.firstElementChild);

  const titleText = document.querySelector(".h-title");

  const currentPath = window.location.pathname.split("/")[1];
  const isAuth = pages.AUTH.includes(currentPath);
  if (isAuth) {
    const apiRes = await authClient.get("/users/profile");
    const dto = await apiRes.json();

    if (dto) {
      avatar = document.getElementById("h-avatar");

      dropdown = document.querySelector("#profileMenu");

      const logoutBtn = document.querySelector("#menuLogout");
      logoutBtn.addEventListener("click", logout);
    } else {
      avatar.hidden = true;
    }
    titleText.addEventListener("click", (e) => {
      window.location.href = getAccessToken() ? HOME : LOGIN;
    });
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  await insertHeader();
  await (async function () {
    const mount = document.querySelector("#app-footer .f-wrap");
    if (!mount || mount.firstElementChild) return;
    const res = await fetch("/semantics/footer/footer.html");
    const html = await res.text();
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    mount.appendChild(t.content.firstElementChild);
  })();
  avatar.addEventListener("click", (e) => {
    dropdown.hidden = !dropdown.hidden;
    const expended = e.target.attributes["aria-expanded"].value;
    e.target.setAttribute("aria-expanded", String(!expended));
  });
});
