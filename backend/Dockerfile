FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --index-url https://pypi.org/simple/ --extra-index-url https://mirrors.yandex.ru/pypi/simple/ -r requirements.txt

COPY . .

RUN mkdir -p alembic/versions

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
