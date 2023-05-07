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

