# Samadhan Setu – Dashboard & Location Release

- Citizen dashboard keeps **current location** and **problem location** separate.
- Problem location records its source: exact browser GPS, address geocoding, or district/ward fallback.
- Accuracy labels are shown explicitly on the dashboard map.
- Citizen community reviews are 1–5 stars and are stored against the authenticated citizen account; public display is anonymised.
- Problem location metadata is included in the cryptographically signed hash-chain event.
- `START_SAMADHAN_SETU.bat` at the ZIP root launches the project without requiring `cd samadhan_setu` first.
- This project uses a single-node, signed hash-chain ledger; it is not a decentralised public blockchain.
