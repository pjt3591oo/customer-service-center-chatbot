-- pgvector extension 활성화
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS qna_cache (
  id SERIAL PRIMARY KEY,
  source_id VARCHAR NOT NULL,
  version INT NOT NULL DEFAULT 1,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  section VARCHAR,
  embedding vector(768),
  status VARCHAR NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- active 상태 벡터에 대한 HNSW 인덱스
CREATE INDEX IF NOT EXISTS qna_cache_embedding_idx
  ON qna_cache USING hnsw (embedding vector_cosine_ops)
  WHERE status = 'active';

-- 조회 성능을 위한 보조 인덱스
CREATE INDEX IF NOT EXISTS qna_cache_guide_version_idx
  ON qna_cache (guide_id, version, status);