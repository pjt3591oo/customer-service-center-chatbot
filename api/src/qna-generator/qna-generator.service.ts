/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Ollama } from 'ollama';
import * as fs from 'fs/promises';
import * as path from 'path';

import { PrismaService } from 'src/db/prisma.service';

const QNA_QUESTION_MODEL = 'qwen2.5-coder:7b';
const EMBEDDING_MODEL = 'nomic-embed-text';

interface QnaSimilarityResult {
  question: string;
  answer: string;
  similarity: number;
}

@Injectable()
export class QnaGeneratorService {
  private readonly logger = new Logger(QnaGeneratorService.name);

  private readonly ollamaQnaQuestion: Ollama;
  private readonly ollamaEmbedding: Ollama;

  constructor(private readonly prisma: PrismaService) {
    this.ollamaQnaQuestion = new Ollama({
      host: process.env.OLLAMA_HOST ?? 'http://localhost:11434',
    });
    this.ollamaEmbedding = new Ollama({
      host: process.env.OLLAMA_HOST ?? 'http://localhost:11434',
    });
  }

  /**
   * 참고 문서 경로 목록을 읽어 "파일명 + 내용" 형태로 합친 문자열을 만든다.
   */
  private async loadReferenceDocs(
    referenceDocsPath: string[],
  ): Promise<string> {
    const docs = await Promise.all(
      referenceDocsPath.map(async (docPath) => {
        try {
          const content = await fs.readFile(docPath, 'utf-8');
          return `### 문서: ${path.basename(docPath)}\n${content}`;
        } catch (err) {
          this.logger.warn(`문서를 읽을 수 없습니다: ${docPath} (${err})`);
          return `### 문서: ${path.basename(docPath)}\n(읽기 실패)`;
        }
      }),
    );
    return docs.join('\n\n---\n\n');
  }

  private buildSystemPrompt(referenceDocsContent: string): string {
    return `
너는 고객센터 챗봇의 질문 응답 생성기야. 사용자가 질문을 하면, 지식 베이스에서 가장 유사한 질문을 찾아서 해당 답변을 제공하려고 해. 만약 유사한 질문이 없다면, 주어진 참고 문서를 바탕으로 가장 유사한 질문과 그에 대한 답변을 생성해줘.
답변을 위해 아래 참고 문서들을 활용할 수 있어. 문서들은 마크다운 형식으로 되어 있고, 각 문서는 여러 섹션으로 나뉘어 있을 수 있어. 질문과 답변을 생성할 때, 해당 질문이 발견된 섹션의 이름도 함께 제공해줘.
그리고 모든 질문과 답변은 고객센터 챗봇에서 사용될 것이기 때문에, 고객이 이해하기 쉬운 언어로 작성해줘.

참고 문서:
${referenceDocsContent}

response format: xml
<answer> 질문에 대한 답변 (본문에서 정확히 찾아서 작성, 추측 금지) </answer>
<section> 질문과 답변이 발견된 섹션 이름 (없으면 null) </section>
`.trim();
  }

  /**
   * 사용자 질문 + 참고 문서를 바탕으로 QnA 후보 목록을 생성한다.
   */
  async generateQnaCandidates(
    userPrompt: string,
    referenceDocsPath: string[],
  ): Promise<any> {
    const referenceDocsContent =
      await this.loadReferenceDocs(referenceDocsPath);
    const systemPrompt = this.buildSystemPrompt(referenceDocsContent);

    const response = await this.ollamaQnaQuestion.chat({
      model: QNA_QUESTION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User Question: ${userPrompt}` },
      ],
      // format: 'json', // JSON 모드 강제 (코드블록 래핑 방지)
      stream: true,
    });

    const rawContent = response;

    try {
      return response;
    } catch (err) {
      this.logger.error(`LLM 응답 JSON 파싱 실패: ${rawContent}`);
      throw new InternalServerErrorException(
        'QnA 후보 생성 응답을 파싱할 수 없습니다.',
      );
    }
  }

  async findSimilar(
    question: string,
    threshold: number,
  ): Promise<QnaSimilarityResult | null> {
    const embedding = await this.ollamaEmbedding.embed({
      model: EMBEDDING_MODEL,
      input: question,
    });

    const vectorLiteral = `[${embedding.embeddings.join(',')}]`;

    const rows = await this.prisma.$queryRaw<QnaSimilarityResult[]>`
      SELECT question, answer, 1 - (embedding <=> ${vectorLiteral}::vector) as similarity, section
      FROM qna_cache
      WHERE status = 'active'
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT 1
    `;

    const top = rows[0];
    if (!top || top.similarity < threshold) {
      return null;
    }

    return top;
  }

  async saveQnaCache({
    question,
    answer,
    section,
    version,
  }: {
    question: string;
    answer: string;
    section: string;
    version: number;
  }): Promise<void> {
    const embedding = await this.ollamaEmbedding.embed({
      model: EMBEDDING_MODEL,
      input: question,
    });
    await this.prisma.$queryRaw`
      INSERT INTO qna_cache (source_id, version, question, answer, section, embedding, status)
      VALUES (${'user_prompt'}, ${version}, ${question}, ${answer}, ${section}, ${`[${embedding.embeddings.join(',')}]`}::vector, ${'active'})
    `;
  }
}
