import { debug, setSugarFormLogLevel } from '../src/util/logger';
import { describe, it } from '@jest/globals';

describe('logger', () => {
  it('should follow log level', () => {

    const [ infoMock, warnMock, debugMock ] = [ jest.fn(), jest.fn(), jest.fn() ];
    global.console.info = infoMock;
    global.console.warn = warnMock;
    global.console.debug = debugMock;

    setSugarFormLogLevel('SILENT');
    debug('DEBUG', 'debug');
    debug('INFO', 'info');
    debug('WARN', 'warn');
    expect(debugMock).toHaveBeenCalledTimes(0);
    expect(infoMock).toHaveBeenCalledTimes(0);
    expect(warnMock).toHaveBeenCalledTimes(0);

    setSugarFormLogLevel('WARN');
    debug('DEBUG', 'debug');
    debug('INFO', 'info');
    debug('WARN', 'warn');
    expect(debugMock).toHaveBeenCalledTimes(0);
    expect(infoMock).toHaveBeenCalledTimes(0);
    expect(warnMock).toHaveBeenCalledTimes(1);
    expect(warnMock).toHaveBeenCalledWith('warn');

    setSugarFormLogLevel('INFO');
    debug('DEBUG', 'debug');
    debug('INFO', 'info');
    debug('WARN', 'warn');
    expect(debugMock).toHaveBeenCalledTimes(0);
    expect(infoMock).toHaveBeenCalledTimes(1);
    expect(infoMock).toHaveBeenCalledWith('info');
    expect(warnMock).toHaveBeenCalledTimes(2);
    expect(warnMock).toHaveBeenLastCalledWith('warn');

    setSugarFormLogLevel('DEBUG');
    debug('DEBUG', 'debug');
    debug('INFO', 'info');
    debug('WARN', 'warn');
    expect(debugMock).toHaveBeenCalledTimes(1);
    expect(debugMock).toHaveBeenCalledWith('debug');
    expect(infoMock).toHaveBeenCalledTimes(2);
    expect(infoMock).toHaveBeenLastCalledWith('info');
    expect(warnMock).toHaveBeenCalledTimes(3);
    expect(warnMock).toHaveBeenLastCalledWith('warn');

  });
});
