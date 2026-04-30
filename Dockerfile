# 1. Use a lightweight Python base image
FROM python:3.11

# 2. Set the directory inside the container
WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your code
COPY . .

# 6. Command to run your script
CMD ["python", "backend/llm.py"]
