from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .llm_service import llm_service
import json

class MatchingService:
    def _construct_profile_text(self, profile):
        """
        Aggregates relevant text fields from a user profile into a single string.
        """
        text_parts = []
        
        # 1. Summary
        if profile.summary:
            text_parts.append(profile.summary)
            
        # 2. Skills (Assuming stored as list in profile, or we parse from elsewhere)
        if hasattr(profile, 'skills') and profile.skills:
             text_parts.append(" ".join(profile.skills))

        # 3. Experience
        for exp in profile.experiences:
            text_parts.append(f"{exp.title} at {exp.company}")
            if exp.description:
                text_parts.append(exp.description)
                
        # 4. Education
        for edu in profile.educations:
            text_parts.append(f"{edu.degree} in {edu.institution}")
            
        return " ".join(text_parts)

    def _construct_job_text(self, job):
        """
        Aggregates relevant text fields from a job listing.
        """
        text_parts = [job.title]
        if job.description:
            text_parts.append(job.description)
        if job.tags: # Assuming comma-separated string
            text_parts.append(job.tags.replace(',', ' '))
        return " ".join(text_parts)

    def calculate_score(self, profile, job):
        """
        Calculates a match score (0-100) using TF-IDF Cosine Similarity.
        Lightweight, no GPU required.
        """
        try:
            profile_text = self._construct_profile_text(profile)
            job_text = self._construct_job_text(job)

            if not profile_text.strip() or not job_text.strip():
                return 0.0

            # TF-IDF Vectorization
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([profile_text, job_text])
            
            # Cosine Similarity
            # matrix[0] is profile, matrix[1] is job
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            
            # Convert to percentage (0.0 to 1.0 -> 0 to 100)
            score = cosine_sim[0][0] * 100
            return float(round(score, 1))
        except Exception as e:
            print(f"Error calculating score: {e}")
            return 0.0

    def generate_explanation(self, profile, job, score):
        """
        Uses Gemini to explain the score.
        """
        profile_text = self._construct_profile_text(profile)
        job_text = self._construct_job_text(job)
        
        system_prompt = """
        You are an expert ATS (Applicant Tracking System) scanner. 
        Compare the candidate profile and the job description.
        The calculated match score is {score}/100.
        
        Provide a JSON response with:
        - "strengths": List of anywhere between 1 to 4 matching skills or experiences (if score is high, then more points here).
        - "missing": List of anywhere between 1 to 4 key requirements missing from the profile (if score is low, then more points here).
        - "verdict": A 1-sentence summary of why this score was given.
        
        Do not include markdown formatting. Return raw JSON.
        """.format(score=score)
        
        user_prompt = f"CANDIDATE PROFILE:\n{profile_text[:2000]}\n\nJOB DESCRIPTION:\n{job_text[:2000]}"
        
        try:
            response_text = llm_service.generate_text(system_prompt, user_prompt)
            # Clean text if Gemini wraps it in ```json ... ```
            if "```" in response_text:
                response_text = response_text.replace("```json", "").replace("```", "")
            return response_text
        except Exception as e:
            print(f"Error generating explanation: {e}")
            return json.dumps({
                "strengths": ["Unable to analyze"],
                "missing": ["Unable to analyze"],
                "verdict": "AI service unavailable."
            })

matching_service = MatchingService()