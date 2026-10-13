# TuneScope

Music discovery platform: cari lagu, artis, dan album, simpan favorit, buat playlist, tulis review, dan lihat aktivitas komunitas.

## Tech Stack
React + TypeScript, Tailwind CSS, FastAPI, PostgreSQL, SQLAlchemy, Alembic, JWT, pytest, Vitest

## Struktur
- `frontend/` : aplikasi React
- `backend/` : REST API FastAPI
- `docs/` : ERD, keputusan arsitektur, desain

## Roadmap
- [x] Phase 1: MVP (Home, Search, detail pages)
- [x] Phase 2: Full stack (auth, favorites, playlist, profile)
- [x] Phase 3: Social (reviews, rating, public playlist, activity feed)
- [ ] Phase 4: Advanced (recommendation)

## Menjalankan proyek

### Prasyarat
- Docker Desktop
- Python 3.12
- Node.js 22

### 1. Database

Jalankan PostgreSQL lewat Docker Compose dari root project:

    docker compose up -d

Lalu buat database khusus untuk test. Cukup sekali saja:

    docker compose exec db psql -U tunescope -d tunescope -c "CREATE DATABASE tunescope_test OWNER tunescope;"

Test memakai database terpisah supaya data development tidak ikut terhapus setiap kali `pytest` dijalankan.

### 2. Backend

Dari folder `backend/`:

    python -m venv .venv
    .venv\Scripts\Activate.ps1
    pip install -r requirements.txt

Buat file `backend/.env`:

    DATABASE_URL=postgresql+psycopg://tunescope:tunescope@localhost:5432/tunescope
    JWT_SECRET=ganti-dengan-string-acak-yang-panjang
    LASTFM_API_KEY=

Jalankan migration lalu server:

    alembic upgrade head
    uvicorn app.main:app --reload

API tersedia di `http://127.0.0.1:8000`, dokumentasi interaktif di `http://127.0.0.1:8000/docs`.

### 3. Frontend

Dari folder `frontend/`:

    npm install
    npm run dev

Aplikasi berjalan di `http://127.0.0.1:5173`. Gunakan `127.0.0.1`, bukan `localhost`, agar cookie autentikasi dikenali oleh backend.

## Testing

Backend, dari folder `backend/`:

    pytest

Frontend, dari folder `frontend/`:

    npm run lint
    npm run test
    npm run build

Tabel di database test dibuat otomatis dari model lewat `backend/tests/conftest.py`, jadi tidak perlu menjalankan migration di sana. Di CI, `DATABASE_URL` ditentukan oleh workflow dan database-nya bersifat sementara.