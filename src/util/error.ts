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

export class SugarFormCalledUnavailableFunctionError extends SugarFormError {

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
