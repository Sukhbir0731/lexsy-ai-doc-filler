import os
from openai import OpenAI

def get_ai_response(message: str, placeholder: str, values: dict = None):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return f"[Mock AI] For {placeholder}, you entered '{message}'."

    client = OpenAI(api_key=api_key)
    context = ""
    if values:
        context = f"So far you have these values: {values}.\n"

    prompt = f"""
                You are Lexsy, an AI assistant helping a user fill placeholders in a Word document.

                Current placeholder: {placeholder}
                User said: "{message}"
                Existing values: {context}

                Your job:
                - Understand what the user means and confirm what you recorded for this placeholder.
                - If the user confirms everything is correct, say so clearly.
                - Dont ask anything, just give confirmation from your side.
                - Keep your tone short, clear, and conversational.

                Respond in one or two short sentences only.
                """



    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            max_output_tokens=120,
        )
        return response.output_text.strip()
    except Exception as e:
        print("AI error:", e)
        return f"[Error] Could not generate AI response for {placeholder}."

