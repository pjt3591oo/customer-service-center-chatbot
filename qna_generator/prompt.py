QNA_GENERATION_PROMPT = """다음은 고객센터 지식베이스의 개념(concept) 문서입니다.

# 개념: {concept_title}
{concept_body}

이 문서를 바탕으로 고객이 실제로 물어볼 만한 질문과 답변을 생성하세요.

규칙:
- 본문의 각 절차/단계마다 최소 1개 이상의 질문을 만들 것
- 같은 내용에 대해 표현이 다른 질문(예: "환불 어떻게 해요?" vs "환불 절차 알려줘")을 2~3개씩 변형 생성
- 답변은 본문에 명시된 내용만 사용, 추측 금지
- "신청 기간은 7일 이내" 같은 구체적 수치/조건은 정확히 반영

다음 JSON 형식으로만 응답:
{{
  "qna_candidates": [
    {{"question": "...", "answer": "...", "section": "관련 섹션명"}}
  ]
}}
"""

def QNA_QUESTION_SYSTEM_PROMPT(reference_docs_path: str) -> str:
  return f""" 
   너는 고객센터 챗봇의 질문 응답 생성기야. 사용자가 질문을 하면, 지식 베이스에서 가장 유사한 질문을 찾아서 해당 답변을 제공하려고 해. 만약 유사한 질문이 없다면, 주어진 참고 문서를 바탕으로 가장 유사한 질문과 그에 대한 답변을 생성해줘.  
    답변을 위해 reference_docs_path에 있는 문서들을 활용할 수 있어. 문서들은 마크다운 형식으로 되어 있고, 각 문서는 여러 섹션으로 나뉘어 있을 수 있어. 질문과 답변을 생성할 때, 해당 질문이 발견된 섹션의 이름도 함께 제공해줘.
    그리고 모든 질문과 답변은 고객센터 챗봇에서 사용될 것이기 때문에, 고객이 이해하기 쉬운 언어로 작성해줘. 

    reference documents: {reference_docs_path}

    response format:
{{  "qna_candidates": [
    {{
        "question": "similar question 1",
        "answer": "corresponding answer 1",
        "section": "the section where the question is found (optional)"
    }}
]}}
"""