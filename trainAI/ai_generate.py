import ollama
from datetime import date
import json
import os

CACHE_FILE = "daily_task_cache.json"

def generate_daily_task() -> dict:
    today = date.today().strftime("%Y-%m-%d")
    
    # Проверяем кэш
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            cached = json.load(f)
            if cached.get("date") == today:
                print("Returning cached task")
                return cached
    
    # Генерируем новое задание
    prompt = f"""You are a fitness coach. Generate a daily fitness challenge for {today}.

Return ONLY a JSON object, no other text:
{{
    "name": "Exercise name",
    "target": 100,
    "unit": "reps/steps/seconds",
    "description": "Short motivational description 2-3 sentences",
    "tips": "One tip on how to complete it"
}}

Rules:
- Exercise must be doable without equipment
- Target should be challenging but achievable for average person
- Keep it simple: pushups, squats, steps, plank, etc.
- Respond in Russian"""

    response = ollama.chat(
        model="deepseek-r1:1.5b",
        messages=[{"role": "user", "content": prompt}]
    )
    
    content = response["message"]["content"]
    
    start = content.find("{")
    end = content.rfind("}") + 1
    json_str = content[start:end]
    
    task = json.loads(json_str)
    task["date"] = today
    
    # Сохраняем кэш
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(task, f, ensure_ascii=False, indent=2)
    
    return task

if __name__ == "__main__":
    task = generate_daily_task()
    print(json.dumps(task, ensure_ascii=False, indent=2))