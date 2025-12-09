import { login } from "../../fetch/loginApi.js";

document.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const loginButton = document.getElementById("loginButton");

  // check email 구현

  loginButton.addEventListener("click", (e) => {
    login({
      email: email.value,
      rawPassword: password.value,
    }).then(() => {
      window.location = "/post-list";
    });
  });
});
