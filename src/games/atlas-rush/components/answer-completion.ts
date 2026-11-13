import { normalizeAnswer } from '../domain/answers';

export const getAnswerCompletionSuffix = (
  answer: string,
  matchedName: string,
): string => {
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedName = normalizeAnswer(matchedName);
  if (
    normalizedAnswer.length === 0 ||
    normalizedName === normalizedAnswer ||
    !normalizedName.startsWith(normalizedAnswer)
  ) {
    return '';
  }
  const characters = Array.from(matchedName);
  const prefixEnd = characters.findIndex(
    (_character, index) =>
      normalizeAnswer(characters.slice(0, index + 1).join('')).length >=
      normalizedAnswer.length,
  );
  return characters.slice(prefixEnd + 1).join('');
};
