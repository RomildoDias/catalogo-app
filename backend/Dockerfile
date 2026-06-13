FROM python:3.11-slim

WORKDIR /app

# Copy from project root context
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY frontend/catalogo/ ./frontend/catalogo/

RUN chmod +x render_start.sh

EXPOSE 8000

CMD ["./render_start.sh"]
