const SugarFormErrorMap = [
  {
    code: 'SF0001',
    name: 'TypeMismatch',
    message: 'Incorrect type detected.\nThis may be a bug in SugarForm itself. It would be helpful if you could post the stack trace to GitHub.',
  },
  {
    code: 'SF0002',
    name: 'DifferentFromTypeDefinition',
    message: 'Incorrect type detected.\nIt is believed that the code does not follow TypeScript type annotations.',
  },
] as const;

export class SugarFormError extends Error {
  constructor(id: (typeof SugarFormErrorMap)[number]['code'], message?: string) {
    const error = SugarFormErrorMap.find(e => e.code === id) ?? {
      code: 'SF9999',
      name: 'SugarFormUnknownError',
      message: 'Unknown error occured.',
    };
    super(`${error.code} (${error.name})\n${error.message}${message !== undefined ? `\ninfo for debug: ${message}` : ''}`);
    this.name = new.target.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
