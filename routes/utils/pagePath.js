import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPagePath = (resource) =>
  path.join(
    __dirname,
    "..",
    "..",
    "public",
    "pages",
    resource,
    `${resource}.html`
  );
