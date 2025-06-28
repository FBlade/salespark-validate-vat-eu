import https from "https";
import { XMLParser } from "fast-xml-parser";

const SERVICE_URL = "https://ec.europa.eu/taxation_customs/vies/services/checkVatService";

const DEFAULT_HEADERS = {
  "Content-Type": "text/xml; charset=utf-8",
  "User-Agent": "SalesPark Validate VAT EU",
  SOAPAction: "",
};

const ERROR_MSG = {
  INVALID_INPUT: "Invalid VAT input: check country code and number",
  INVALID_RESPONSE: "VIES returned an invalid or unprocessable response",
};

const soapTemplate = `<?xml version="1.0" encoding="UTF-8"?>
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <checkVat xmlns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
        <countryCode>$COUNTRY_CODE</countryCode>
        <vatNumber>$VAT_NUMBER</vatNumber>
      </checkVat>
    </soap:Body>
  </soap:Envelope>`;

const EU_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "EL",
  "ES",
  "FI",
  "FR",
  "HR",
  "HU",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
];

export interface VatCheckResult {
  countryCode: string;
  vatNumber: string;
  valid: boolean;
  name: string;
  address: string;
  requestDate: string;
}

export async function validateVatEU(countryCode: string, vatNumber: string, timeoutMs = 10000): Promise<VatCheckResult> {
  countryCode = countryCode.toUpperCase();
  if (!EU_COUNTRIES.includes(countryCode) || !vatNumber) {
    throw new Error(ERROR_MSG.INVALID_INPUT);
  }

  const xml = soapTemplate.replace("$COUNTRY_CODE", countryCode).replace("$VAT_NUMBER", vatNumber).trim();

  const headers = {
    ...DEFAULT_HEADERS,
    "Content-Length": Buffer.byteLength(xml),
  };

  return new Promise((resolve, reject) => {
    const req = https.request(SERVICE_URL, { method: "POST", headers, timeout: timeoutMs }, (res) => {
      let data = "";
      res.setEncoding("utf8");

      res.on("data", (chunk) => (data += chunk));

      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`VIES service returned HTTP ${res.statusCode}`));
        }

        const parser = new XMLParser({
          ignoreAttributes: false,
          removeNSPrefix: true,
          parseTagValue: true,
        });

        let json: any;
        try {
          json = parser.parse(data);
        } catch {
          return reject(new Error("Failed to parse VIES XML response"));
        }

        const response = json.Envelope?.Body?.checkVatResponse;

        if (!response || typeof response.valid === "undefined") {
          return reject(new Error(ERROR_MSG.INVALID_RESPONSE));
        }

        if (typeof response.countryCode !== "string" || typeof response.vatNumber === "undefined" || typeof response.valid !== "boolean") {
          return reject(new Error("Incomplete or malformed VAT response"));
        }

        resolve({
          countryCode: response.countryCode,
          vatNumber: response.vatNumber,
          valid: response.valid === true,
          name: response.name?.trim() || "",
          address: response.address?.trim() || "",
          requestDate: response.requestDate,
        });
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("VIES request timed out"));
    });

    req.on("error", reject);
    req.write(xml);
    req.end();
  });
}
