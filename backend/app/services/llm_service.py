import os
import json
import google.generativeai as genai

class LLMService:
    def __init__(self):
        self.mode = "mock" # Default to mock

        api_key = os.getenv("GEMINI_API_KEY")
        if api_key and api_key != "mock":
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self.mode = "gemini"

    def generate_text(self, system_prompt, user_prompt):
        """
        Generates text based on prompts.
        """
        if self.mode == "mock":
            return self._mock_response(system_prompt, user_prompt)
        elif self.mode == "gemini":
            try:
                # Gemini doesn't support system prompt in v1 natively in the same way as OpenAI,
                # but we can prepend it.
                combined_prompt = f"{system_prompt}\n\nUser Request: {user_prompt}"
                response = self.model.generate_content(combined_prompt)
                return response.text
            except Exception as e:
                print(f"Gemini API Error: {e}")
                return self._mock_response(system_prompt, user_prompt) # Fallback to mock on error

        return "Error: No LLM provider configured."

    def _mock_response(self, system_prompt, user_prompt):
        """
        Returns hardcoded responses based on the task inferred from system prompt.
        """
        system_prompt_lower = system_prompt.lower()

        if "job description" in system_prompt_lower:
            return json.dumps({
                "generated_description": "We are seeking a highly skilled professional to join our dynamic team. You will be responsible for...",
                "generated_responsibilities": ["Design and implement software.", "Collaborate with cross-functional teams.", "Ensure code quality."],
                "generated_qualifications": ["Bachelor's degree in Computer Science.", "3+ years of experience.", "Strong problem-solving skills."]
            })

        if "cover letter" in system_prompt_lower:
            return "Dear Hiring Manager,\n\nI am writing to express my strong interest in this position. With my background in [Skill 1] and [Skill 2], I am confident I can contribute effectively to your team.\n\nSincerely,\n[Name]"

        if "interview guide" in system_prompt_lower:
            return json.dumps({
                "job_title": "Target Role",
                "behavioral_questions": ["Tell me about a time you failed.", "How do you handle conflict?"],
                "technical_questions": ["Explain X concept.", "How would you solve Y?"],
                "scoring_rubric": "1-5 scale based on clarity and depth."
            })

        if "summarize feedback" in system_prompt_lower:
            return json.dumps({
                "summary": "The candidate showed strong technical skills but lacked communication clarity.",
                "strengths": ["Technical knowledge", "Problem solving"],
                "weaknesses": ["Communication", "Cultural fit"],
                "recommendation": "hire" # or no_hire
            })

        if "rank resumes" in system_prompt_lower:
            # This expects a JSON structure in response usually?
            # Or the service returns text and we parse it.
            # For ranking, we usually return a list.
            return "Rank 1: Candidate A (90%)\nRank 2: Candidate B (85%)"

        return f"AI Response: {user_prompt[:50]}..."

    def parse_resume_mock(self, file_content):
        """
        Mock resume parsing.
        """
        return {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com",
            "phone": "123-456-7890",
            "skills": ["Python", "Flask", "React"],
            "summary": "Experienced developer..."
        }

llm_service = LLMService()
