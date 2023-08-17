/* eslint-disable max-classes-per-file */

export class SugarFormError extends Error {

  constructor(message: string, permalink: string | null) {

    const errorName = new.target.name;

    super([
      `${errorName}: ${message}`,
      ...(permalink === null ? [] : [
        '',
        `See: https://docs.sugarform.io/errors/${permalink}`,
      ]),
    ].join('\n'));

    this.name = errorName;
    Error.captureStackTrace(this, this.constructor);
  }

}

export class SugarFormUnavailableFunctionError extends SugarFormError {

  constructor(path: string, name: string) {
    super(
      [
        `The sugar property of ${path} is not supposed to call the ${name} function because the type does not satisfy the constraint.`,
        `Therefore, ${name} is not included in the TypeScript type system, but was called against it for some reason.`,
      ].join('\n'),
      null,
    );
  }

}

export class SugarFormAssertionError extends SugarFormError {
  constructor(path: string, message: string) {
    super(
      [
        `Assertion failed in ${path}: ${message}`,
        'This is a bug in Sugarform. Please report it to https://github.com/sugarform-dev/sugarform/issues',
      ].join('\n'),
      null,
    );
  }

}

export class SugarFormUnmountedSugarError extends SugarFormError {
  constructor(path: string) {
    super(
      [
        `Cannot get the value of unmounted sugar "${path}".`,
        'If this error occurs even though the value was obtained after it was mounted, it is possible that the value was forced to be unmounted externally.',
      ].join('\n'),
      null,
    );
  }
}

