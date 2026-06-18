export const extractPartialXml = (raw: string, tag: string): string => {
  // 닫힘 태그 있는 경우: <answer>내용</answer>
  const complete = raw.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  if (complete) return complete[1].trim();

  // 닫힘 태그 없는 경우 (스트리밍 중): <answer>내용...
  const partial = raw.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*)`));
  if (partial) return partial[1].trim();

  return '';
};

