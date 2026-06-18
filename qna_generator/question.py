import os

from utils import search_similar_questions, user_prompt_to_qna_candidates, insert_qna_cache, get_version, embed_text
from pg import get_connection 
import json


if __name__ == "__main__":
  user_prompts = [
    #  "주문을 어떻게 접수하나요?",
     "주문 접수 방법",
    #  "탈퇴 후 다시 회원가입하면 주문 내역은 어떻게 되나요?",
    #  "회원 탈퇴 후 재가입 시 주문 내역",
  ]
  for user_prompt in user_prompts:
    results = search_similar_questions(user_prompt, top_k=1, threshold=0.15)
    results = []
    # cache hit 
    for result in enumerate(results):
        idx, (question, answer, section, embedding, distance) = result
        # distance가 0에 가까울수록 유사도가 높음
        print(f"Cache Hit! Similar question found in cache with distance {distance:.4f}")
        print(f"User Prompt: {user_prompt}")
        print(f"Result {idx}: {question} -> {answer} (Distance: {distance:.4f})")
        print("-" * 50)
  

    # cache miss
    if not results:
        print(f"User Prompt: {user_prompt}")
        print("No similar question found in cache.")

        md_files = os.listdir("../llmwiki/wiki/concepts/")
        file_contents = []

        for md_file in md_files:
            with open(os.path.join("../llmwiki/wiki/concepts/", md_file), "r", encoding="utf-8") as f:
              file_contents.append(f.read())

        response = user_prompt_to_qna_candidates(
           user_prompt, 
           reference_docs_path=md_files,
           concept_docs=file_contents
        )

        answer = response["answer"]
        section = response["section"]
        version = get_version("./qna_candidates/")
        source_id = 'user_prompt'
        qna_list = []

        qna_list.append({
            "question": user_prompt,
            "answer": answer,
            "section": section,
            "embedding": embed_text(answer),
        })
        conn = get_connection()

        if (answer is not None):
          insert_qna_cache(
            conn, 
            source_id="user_prompt", 
            version=version, 
            qna_list=qna_list
          )
        
        print("LLM Response:")
        print(response)
        print("-" * 50)