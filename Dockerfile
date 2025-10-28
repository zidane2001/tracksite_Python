# Étape 1 — Builder le frontend
FROM node:18 AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 — Lancer le backend Python (Flask)
FROM python:3.11-slim
WORKDIR /app

# Copier les dépendances backend
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install -r backend/requirements.txt

# Copier le backend
COPY backend ./backend

# Copier le build frontend
COPY --from=frontend-builder /app/dist ./dist

# Exposer le port Flask
EXPOSE 5000

# Lancer Flask
CMD ["python", "backend/app.py"]
