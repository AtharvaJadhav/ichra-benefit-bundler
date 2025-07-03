# ICHRA Benefit Bundler

Optimize health plan selections for employees using CMS marketplace data.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend (UI) Setup](#frontend-ui-setup)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [API Usage](#api-usage)
- [Sample cURL](#sample-curl)
- [Troubleshooting](#troubleshooting)
- [Notes](#notes)

---

## Overview
This project provides a full-stack solution for optimizing ICHRA (Individual Coverage Health Reimbursement Arrangement) benefit bundles using real CMS marketplace data. It includes:
- A FastAPI backend for data ingestion, plan optimization, and API endpoints
- A modern frontend UI for configuring and visualizing optimal plan bundles

---

## Features
- Loads and processes large CMS PUF datasets (plan, rate, benefits, service area)
- **In-memory caching:** CMS data is loaded once at server startup and reused for all API calls for high performance
- Exposes a flexible `/api/optimize` endpoint for plan selection with rich constraints
- Supports filtering by premium, deductible, actuarial value, metal level, plan type, HSA eligibility, and required benefits
- In-memory caching and logging for performance
- Modern, user-friendly UI (React/Vite/Tailwind)

---

## Project Structure
```
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI endpoints
│   │   ├── core/          # Config
│   │   ├── models/        # Pydantic models
│   │   ├── optimization/  # PuLP optimization logic
│   │   ├── services/      # Data and bundle services
│   │   └── main.py        # FastAPI app entrypoint
│   ├── data/              # CMS CSV files (not tracked in git)
│   ├── requirements.txt   # Python dependencies
│   └── env.example        # Backend environment variables template
├── UI/                    # Frontend app (React/Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── README.md              # This file
```

---

## Backend Setup
1. **Install Python dependencies:**
   ```sh
   pip install -r backend/requirements.txt
   ```
2. **Set up environment variables:**
   ```sh
   cp backend/env.example backend/.env
   # Edit backend/.env as needed
   ```
3. **Add CMS data files:**
   - Place the required CSVs in `backend/data/` (see `backend/data/README.md` for details)
4. **Run the backend server:**
   ```sh
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
5. **API docs:**
   - Visit [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Frontend (UI) Setup
1. **Install Node.js dependencies:**
   ```sh
   cd UI
   npm install
   ```
2. **Run the frontend:**
   ```sh
   npm run dev
   ```
3. **Visit the app:**
   - [http://localhost:5174](http://localhost:5174) (or as shown in your terminal)

---

## Environment Variables
- See `backend/env.example` for required backend variables (e.g., Redis URL, API host/port)
- The UI may use its own `.env` for API URLs, etc.

---

## Testing
- **Backend:**
  - Run test scripts in `backend/` (e.g., `test_optimization.py`) to verify optimization logic
- **Frontend:**
  - Use the UI to configure and run optimizations visually
- **API:**
  - Use curl/Postman to hit endpoints directly

---

## API Usage
### POST `/api/optimize`
Request body (JSON):
```
{
  "age": 30,
  "risk_score": 0.3,
  "budget_cap": 500,
  "state_code": "AK",
  "max_monthly_premium": 500,
  "min_actuarial_value": 70,
  "preferred_metal_level": "Bronze",
  "preferred_plan_type": "PPO",
  "max_deductible": 5000,
  "hsa_eligible_only": false,
  "required_benefits": [
    "Routine Dental Services (Adult)",
    "Dental Check-Up for Children",
    "Basic Dental Care - Child",
    "Orthodontia - Child",
    "Emergency Room",
    "Urgent Care",
    "Primary Care Physician",
    "Specialist",
    "Prescription Drugs"
  ],
  "tobacco_preference": "No Preference"
}
```

### Response
Returns the optimal plan and metrics as JSON.

---

## Sample cURL
```sh
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "risk_score": 0.3,
    "budget_cap": 500,
    "state_code": "AK",
    "max_monthly_premium": 500,
    "min_actuarial_value": 70,
    "preferred_metal_level": "Bronze",
    "preferred_plan_type": "PPO",
    "max_deductible": 5000,
    "hsa_eligible_only": false,
    "required_benefits": [
      "Routine Dental Services (Adult)",
      "Dental Check-Up for Children",
      "Basic Dental Care - Child",
      "Orthodontia - Child",
      "Emergency Room",
      "Urgent Care",
      "Primary Care Physician",
      "Specialist",
      "Prescription Drugs"
    ],
    "tobacco_preference": "No Preference"
  }'
```

---

## Troubleshooting

### UI/Frontend
- **Vite bad interpreter error:**
  - Run:
    ```sh
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install
    npm run dev
    ```
- **TypeScript import errors:**
  - Check for typos and case sensitivity in filenames and imports.
  - Restart your dev server after adding new files.
- **Screenshots:**
  - Place images in a top-level `screenshots/` folder and reference them in your README.

### Backend
- **ModuleNotFoundError: No module named 'app':**
  - Always run `uvicorn` from inside the `backend` directory:
    ```sh
    cd backend
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```
- **CSV row limit for testing:**
  - The backend loads a maximum of 1000 rows from each CMS CSV for fast development. Adjust `nrows` in `data_service.py` if needed.
- **Address already in use:**
  - Kill the process using the port or use a different port.

---

## Notes
- Large CMS data files are **not tracked in git**. See `.gitignore` and `backend/data/README.md` for details.
- **Performance:** CMS data is loaded once at server startup and cached in memory for all API calls. This makes optimization fast and efficient.
- For fast testing, you can shrink CSVs to a few rows using `head -n 21 file.csv > file-small.csv`.
- For production, restore full data and ensure all environment variables are set.
- For any issues, check logs or open an issue.

---

**Good luck with your submission!** 