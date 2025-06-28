# validate-vat-eu

Modern TypeScript module to validate European VAT numbers using the official [VIES](https://ec.europa.eu/taxation_customs/vies/) SOAP API.

No dependencies beyond `fast-xml-parser` and native Node.js HTTPS. Fully typed, promise-based, and production-ready.

---

## 📦 Installation

```bash
yarn add @salespark/validate-vat-eu

# or

npm install @salespark/validate-vat-eu
```

---

## 🚀 Usage

```ts
import { validateVatEU } from "@salespark/validate-vat-eu";

const result = await validateVatEU("PT", "502011378");

console.log(result);
/*
{
  countryCode: 'PT',
  vatNumber: '502011378',
  valid: true,
  name: 'SIBS FORWARD PAYMENT SOLUTIONS SA',
  address: 'RUA SOUSA MARTINS, 1\n1050-094 LISBOA',
  requestDate: '2025-06-28+02:00'
}
*/
```

---

## 🧾 API

### `validateVatEU(countryCode: string, vatNumber: string, timeoutMs?: number): Promise<VatCheckResult>`

Validates a European VAT number using the official VIES SOAP API.

---

#### Parameters

| Parameter     | Type     | Description                                                               |
| ------------- | -------- | ------------------------------------------------------------------------- |
| `countryCode` | `string` | Two-letter ISO 3166-1 alpha-2 country code (e.g. `'PT'`, `'DE'`)          |
| `vatNumber`   | `string` | VAT number without the country prefix (digits or alphanumeric, no spaces) |
| `timeoutMs`   | `number` | Optional request timeout in milliseconds (default: `7000`)                |

---

#### Returns

A `Promise` that resolves to the following object:

```ts
interface VatCheckResult {
  countryCode: string;
  vatNumber: string;
  valid: boolean;
  name: string;
  address: string;
  requestDate: string;
}
```

---

## 📝 Notes

- Only VAT numbers registered for intra-community operations will return `valid: true`.
- Some VAT numbers that are valid at national level might not be registered in the VIES system.
- VIES service availability may vary — it's not guaranteed to be 100% online.
- This package uses the official SOAP endpoint:  
  `https://ec.europa.eu/taxation_customs/vies/services/checkVatService`

---

## 🧪 Testing

You can test with a known valid VAT number:

```ts
validateVatEU("PT", "502011378"); // Should return valid: true
```

---

### 🛠 Built With

```markdown
## 🛠 Built With

- [Node.js `https`](https://nodejs.org/api/https.html) – native module for secure HTTP requests
- [fast-xml-parser](https://www.npmjs.com/package/fast-xml-parser) – lightweight, performant XML parsing
- [TypeScript](https://www.typescriptlang.org/) – strict typing and developer tooling
```

---

## 📄 License

MIT © [SalesPark](https://salespark.io)
