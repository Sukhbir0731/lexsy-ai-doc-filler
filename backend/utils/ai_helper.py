import os
from openai import OpenAI

def get_ai_response(message: str, placeholder: str):
    """Call GPT model or return mock response if no key set."""
    api_key = os.getenv("OPENAI_API_KEY")  
    if not api_key:
        return f"[Mock AI] For {placeholder}, you entered '{message}'."

    try:
        client = OpenAI(api_key=api_key)
        prompt = f"You are helping fill a legal document. Placeholder: {placeholder}. User input: {message}."
        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            max_output_tokens=100,
        )
        return response.output_text.strip()
    except Exception as e:
        print("AI error:", e)
        return f"[Error] Could not generate AI response for {placeholder}."
