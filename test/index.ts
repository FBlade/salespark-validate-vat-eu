import { validateVatEU } from "../dist/index.js";

validateVatEU("PT", "516793233").then(console.log).catch(console.error);
