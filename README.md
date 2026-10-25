# PDF to Hindi & Hinglish

## Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
(WeasyPrint needs system libs, and the Noto Sans Devanagari font installed on the machine.)

## Frontend
npm create vite@latest frontend -- --template react   # then copy src/ and index.html over it
cd frontend
npm install tailwindcss @tailwindcss/vite
# in vite.config.js: import tailwindcss from "@tailwindcss/vite"; plugins: [react(), tailwindcss()]
npm run dev
