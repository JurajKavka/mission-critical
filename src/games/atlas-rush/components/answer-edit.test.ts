import { describe, expect, it } from 'vitest';
import { editAnswerText } from './answer-edit';

describe('answer editing', () => {
  it('inserts at the cursor and replaces a selection', () => {
    expect(editAnswerText('CANADA', 3, 3, 'X', false)).toEqual({
      value: 'CANXADA',
      caret: 4,
    });
    expect(editAnswerText('CANADA', 0, 6, 'PERU', false)).toEqual({
      value: 'PERU',
      caret: 4,
    });
  });
  it('backspaces a character or the selected range', () => {
    expect(editAnswerText('PERU', 3, 3, '', true)).toEqual({
      value: 'PEU',
      caret: 2,
    });
    expect(editAnswerText('PERU', 1, 3, '', true)).toEqual({
      value: 'PU',
      caret: 1,
    });
    expect(editAnswerText('PERU', 0, 0, '', true)).toEqual({
      value: 'PERU',
      caret: 0,
    });
  });
});
