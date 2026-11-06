export type AnswerEdit = { readonly value: string; readonly caret: number };

export const editAnswerText = (
  value: string,
  start: number,
  end: number,
  inserted: string,
  isBackspace: boolean,
): AnswerEdit => {
  const from = isBackspace && start === end ? Math.max(0, start - 1) : start;
  return {
    value: `${value.slice(0, from)}${inserted}${value.slice(end)}`,
    caret: from + inserted.length,
  };
};
