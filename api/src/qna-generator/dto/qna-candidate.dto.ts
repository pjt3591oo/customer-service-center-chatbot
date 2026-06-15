/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsArray, ArrayMinSize, IsNotEmpty } from 'class-validator';

export class GenerateQnaDto {
  @IsString()
  @IsNotEmpty()
  userPrompt!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  referenceDocsPath!: string[];
}

export interface QnaCandidate {
  question: string;
  answer: string;
  section?: string;
}

export interface QnaCandidatesResponse {
  qna_candidates: QnaCandidate[];
}
