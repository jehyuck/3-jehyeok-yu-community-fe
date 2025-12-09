var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();
var PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

// 정적파일 사전 검증 로직 필요
const PAGES = [
  "/login",
  "/user-form",
  "/post",
  "/post-form",
  "/post-list",
  "/404",
];

// 정적 js로 필요한 값 가져오는 동작, be url을 express에서 관리하기 위해 여기에 작성.
app.get("/config.js", (req, res) => {
  const baseUrl =
    process.env.BASE_URL ??
    (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8080");
  const imageUrl =
    process.env.IMAGE_URL ??
    (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8080");

  res.type("application/javascript")
    .send(`export const BASE_URL = ${JSON.stringify(baseUrl)};
    export const IMAGE_URL = ${JSON.stringify(imageUrl)};`);
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "assets", "favicon.ico"));
});

app.use(PAGES, (req, res) => {
  const name = req.baseUrl.slice(1); // "/login" -> "login"
  const file = path.join(__dirname, "public", "pages", name, `${name}.html`);
  res.sendFile(file, (err) => {
    if (err) {
      res
        .status(404)
        .sendFile(path.join(__dirname, "public", "pages", "404", "404.html"));
    }
  });
});

// catch 404, PAGES로 관리되지 않는 경로 탐색 시 404
app.use((req, res) => {
  if (req.path === "/" || req.path === undefined) {
    res.redirect("/login");
    return;
  }

  res
    .status(404)
    .sendFile(path.join(__dirname, "public", "pages", "404", "404.html"));
});

// 에러 핸들러: 텍스트/JSON로 처리
app.use((err, req, res, next) => {
  console.error(req.url);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server Error" });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}

module.exports = app;
