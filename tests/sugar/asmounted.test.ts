import { describe, it } from '@jest/globals';
import { createEmptySugar } from '@component/sugar/create';
import { TextBoxMock } from '#/misc';

describe('sugar.asMounted', () => {
  it('should call instantly if mounted', () => {
    const fn = jest.fn();
    const sugar = createEmptySugar<string>('path', 'abc');
    new TextBoxMock(sugar);

    sugar.asMounted(sugar => {
      fn(sugar.mounted);
    });
    expect(fn).toHaveBeenCalledWith(true);
  });
  it('should call after mounted', () => {
    const fn = jest.fn();
    const sugar = createEmptySugar<string>('path', 'abc');
    sugar.asMounted(sugar => {
      fn(sugar.mounted);
    });
    expect(fn).not.toHaveBeenCalled();
    new TextBoxMock(sugar);
    expect(fn).toHaveBeenCalledWith(true);
  });
});
