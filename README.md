# IOC/Indicators Manager 

A system for managing and tracking indicators (IP, Domain, Hash) from various sources.
Entities: Indicator, Source, Tag, Verdict (malicious/suspicious/benign).


**Server:** Node.js, Express, SQLite, JWT, RBAC, Helmet, CORS  
**Client:** React + Vite + TailwindCSS

## Run
1) Server
```bash
cd server
# Windows: copy .env.example .env
cp .env.example .env
npm install
npm run seed
npm run dev
```
2) Client
```bash
cd client
npm install
npm run dev
```
Login with:
- admin@local / S3cureAdmin!
- analyst@local / Analyst123!
- viewer@local / Viewer123!
