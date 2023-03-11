/* eslint-disable no-console */
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'SILENT';
let SugarFormLogLevel: LogLevel = 'SILENT';
export function setSugarFormLogLevel(level: LogLevel): void {
  SugarFormLogLevel = level;
}

export function debug(level: LogLevel, message: string): void {
  if (SugarFormLogLevel === 'SILENT') return;
  if (level === 'WARN') {
    console.warn(message);
    return;
  }
  if (SugarFormLogLevel === 'WARN') return;
  if (level === 'INFO') {
    console.info(message);
    return;
  }
  if (SugarFormLogLevel === 'INFO') return;
  if (level === 'DEBUG') {
    console.debug(message);
    return;
  }
}
