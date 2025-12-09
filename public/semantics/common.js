import { AvatarComponent } from "./header/avatar.js";
import { BASE_URL } from "/config.js";
const HOME = "post-list";

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
  titleText.addEventListener("click", (e) => {
    window.location.href = `${window.location.origin}/${HOME}`;
  });
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

    // footer 링크들을 BASE_URL로 설정
    const footerLinks = document.querySelectorAll("#app-footer .f-link");
    const termsLink = footerLinks[0];
    const privacyLink = footerLinks[1];

    if (termsLink) {
      termsLink.setAttribute("href", BASE_URL + "/terms");
    }
    if (privacyLink) {
      privacyLink.setAttribute("href", BASE_URL + "/privacy");
    }
  })();

  const avatar = new AvatarComponent(".h-actions");
  avatar.init();
});
