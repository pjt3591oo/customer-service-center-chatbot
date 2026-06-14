import json, ollama, os, pprint
from psycopg2.extras import execute_values
from prompt import QNA_GENERATION_PROMPT, QNA_QUESTION_SYSTEM_PROMPT
from pg import get_connection

EMBEDDING_MODEL = "nomic-embed-text"
QNA_GENERATE_MODEL = "qwen2.5-coder:7b"
QNA_QUESTION_MODEL = "gemma3:27b"

def get_concept_files(file_path: str = '../llmwiki/wiki/concepts/') -> str:
    files = os.listdir(file_path) 
    return files

def read_concept_file(file_path: str) -> dict:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    title = os.path.basename(file_path).replace('.md', '').replace('_', ' ')
    return {
        "source_id": f"concepts/{os.path.basename(file_path)}",
        "title": title,
        "body": content
    }

def generate_qna(concept: dict, model=QNA_GENERATE_MODEL) -> list[dict]:
    prompt = QNA_GENERATION_PROMPT.format(
        concept_title=concept["title"],
        concept_body=concept["body"]
    )
    response = ollama.chat(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        format="json",
    )
    return json.loads(response["message"]["content"])["qna_candidates"]


def embed_text(text: str, model=EMBEDDING_MODEL) -> list[float]:
    return ollama.embeddings(model=model, prompt=text)["embedding"]


def insert_qna_cache(conn, source_id: str, version: int, qna_list: list[dict]):
    rows = []
    for qna in qna_list:
        embedding = embed_text(qna["question"])
        rows.append((
            source_id, version, qna["question"], qna["answer"],
            qna.get("section"), embedding, "active"
        ))
    pprint.pprint(len(rows))  # 삽입할 데이터 샘플 출력
    with conn.cursor() as cur:
        execute_values(cur, """
            INSERT INTO qna_cache (source_id, version, question, answer, section, embedding, status)
            VALUES %s
        """, rows, template="(%s, %s, %s, %s, %s, %s::vector, %s)")
    conn.commit()

def get_version(target_dir: str) -> int:
    version = 0
    version_file = os.path.join(target_dir, ".version")
    if os.path.exists(version_file):
        with open(version_file, "r", encoding="utf-8") as f:
            version = int(f.read().strip())
    return version

def load_approved(source_id: str, json_path: str, version: int = 1):
    conn = get_connection()

    with open(json_path, "r", encoding="utf-8") as f:
        qna_list = json.load(f)

    insert_qna_cache(conn, source_id, version, qna_list)
    print(f"{source_id}: {len(qna_list)}개 적재 완료")
    conn.close()

def generate_qna_for_concept():
    concept_dir = '../llmwiki/wiki/concepts/'
    files = get_concept_files(concept_dir)
    concept_files = [f for f in files if f.endswith(".md")]
    concepts = [read_concept_file(os.path.join(concept_dir, f)) for f in concept_files]
    print(f"총 {len(concepts)}개의 컨셉 파일을 읽음.")

    conn = get_connection()
    dir = "qna_candidates"
    os.makedirs(dir, exist_ok=True)
    
    version = 0

    with open(dir + "/.version", "r", encoding="utf-8") as f:
        version = int(f.read().strip()) + 1
        os.makedirs(f"{dir}/v{version}", exist_ok=True)

    for concept in concepts:
        print(f"처리 중: {concept['source_id']}")
        qna_candidates = generate_qna(concept)
        print(f"  생성된 QnA: {len(qna_candidates)}개")

        # 검토 전 파일로 출력
        out_path = f"{dir}/v{version}/qna_candidates_{concept['source_id'].replace('/', '_')}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(qna_candidates, f, ensure_ascii=False, indent=2)
        print(f"  저장: {out_path} (검토 후 적재 진행)")
        

    with open(dir + "/.version", "w", encoding="utf-8") as f:
        f.write(str(version))
    
    conn.close()

# insert guide_cache_version 
def update_guide_cache_version(version: int):
    conn = get_connection()

    with conn.cursor() as cur:
        cur.execute("""
            update qna_cache set status = %s where version != %s
        """, ("inactive", version))
        cur.execute("""
            update qna_cache set status = %s where version = %s
        """, ("active", version))
    conn.commit()
    print(f"guide_cache_version이 v{version}로 업데이트 됨.")
    conn.close()

# user prompt vector similarity -> qna_cache에서 question embedding과 유사한 질문 검색
def search_similar_questions(user_prompt: str, top_k: int = 1, threshold: float = 0.15) -> list[dict]:
    user_embedding = ollama.embeddings(model=EMBEDDING_MODEL, prompt=user_prompt)["embedding"]
    conn = get_connection()
    vector = f"ARRAY{user_embedding}::vector"
    query = f"""
        SELECT question, answer, section, embedding,
        (embedding <=> {vector}) AS distance
        FROM qna_cache
        WHERE status = 'active' AND (embedding <=> {vector}) < {threshold}
        ORDER BY embedding <=> {vector}
        LIMIT {top_k}
    """
    rows = []

    with conn.cursor() as cur:
        cur.execute(query)  
        rows = cur.fetchall() # [(question, answer, section, embedding), ...]
        if not rows:
           rows = []  # 유사한 질문이 없는 경우 빈 리스트 반환
    conn.close()

    return rows

def user_prompt_to_qna_candidates(user_prompt: str, reference_docs_path: list[str]) -> list[dict]:
    # split user prompt and system prompt 
    system_prompt = QNA_QUESTION_SYSTEM_PROMPT(reference_docs_path)
    user_prompt = f"User Question: {user_prompt}"
    response = ollama.chat(model=QNA_QUESTION_MODEL, messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}])
    return response["message"]["content"]
