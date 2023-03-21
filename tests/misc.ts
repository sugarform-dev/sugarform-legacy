import { renderHook } from '@testing-library/react';
import type { MutableRefObject } from 'react';
import type { Sugar } from '../src';
export const renderHookResult = <T,>(hook: () => T): T => renderHook(hook).result.current;

export class TextBoxMock {

  private defaultValue: MutableRefObject<string | undefined>;
  private onChange: (() => void) | null = null;
  private onBlur: (() => void) | null = null;

  private mounted = false;

  private _value = '';
  public get value(): string {
    return this._value;
  }
  public set value(newValue: string) {
    this._value = newValue;
    this.onChange?.();
    this.onBlur?.();
  }

  constructor(public sugar: Sugar<string>) {
    const result = renderHookResult(() => sugar.useFromRef({
      get: () => this.mounted ? { success: true, value: this.value } : undefined,
      set: (newValue) => {
        if (!this.mounted) {
          return false;
        }
        this._value = newValue;
        return true;
      },
    }));
    this.onChange = result.onChange;
    this.onBlur = result.onBlur;
    this.defaultValue = result.defaultValueRef;
  }

  public mount(): void {
    this.mounted = true;
    this.value = this.defaultValue.current ?? this.value;
  }

}
