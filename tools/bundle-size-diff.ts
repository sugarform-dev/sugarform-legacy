/* eslint-disable no-console */
import { readFile } from 'fs/promises';
import { resolve } from 'path';

interface Diff {
  head: number;
  base: number;
  diff: number;
}

interface DiffResult {
  cjs: Diff;
  esm: Diff;
  package: Diff;
}

function getDiff(): DiffResult {

  const size = { head: process.env.HEAD_RESULT, base: process.env.BASE_RESULT };
  if (size.head === undefined || size.base === undefined) {
    console.error('Put $HEAD_RESULT and $BASE_RESULT');
    process.exit(1);
  }

  const [ headCjs, headEsm, headPackage ] = size.head.split(':').map(v => parseInt(v, 10));
  const [ baseCjs, baseEsm, basePackage ] = size.base.split(':').map(v => parseInt(v, 10));
  if (
    headCjs === undefined || headEsm === undefined || headPackage === undefined ||
    baseCjs === undefined || baseEsm === undefined || basePackage === undefined
  ) {
    console.error('Error: invalid size format.');
    process.exit(1);
  }

  return {
    cjs: { head: headCjs, base: baseCjs, diff: headCjs - baseCjs },
    esm: { head: headEsm, base: baseEsm, diff: headEsm - baseEsm },
    package: { head: headPackage, base: basePackage, diff: headPackage - basePackage },
  };

}

function exportToMarkdown(data: DiffResult): void {
  const result = [
    '## Bundle Size Summary',
    '||Base branch|HEAD branch|Diff|',
    '|--:|:--:|:--:|:--:|',
    [
      '',
      'CommonJS',
      formatSize(data.cjs.base), formatSize(data.cjs.head),
      `**${getSymbol(data.cjs.diff)} ${formatSize(Math.abs(data.cjs.diff))}**`,
      '',
    ].join('|'),
    [
      '',
      'ES Module',
      formatSize(data.esm.base), formatSize(data.esm.head),
      `**${getSymbol(data.esm.diff)} ${formatSize(Math.abs(data.esm.diff))}**`,
      '',
    ].join('|'),
    [
      '',
      'Package',
      formatSize(data.package.base), formatSize(data.package.head),
      `**${getSymbol(data.package.diff)} ${formatSize(Math.abs(data.package.diff))}**`,
      '',
    ].join('|'),
  ].join('\n');
  console.log(result);
  return;
}

export function getSymbol(diff: number): string {
  return diff === 0 ? '+/-' : diff < 0 ? '-' : '+';
}
export function formatSize(byte: number): string {
  return `${Math.round(byte / 10) / 100} kB`;
}

async function main(): Promise<void> {
  const args = process.argv;
  switch (args[2]) {
  case 'inspect': {
    const packageName = args[3];
    if (packageName === undefined) {
      console.error('Error: package name not specified.');
      console.log('Usage: yarn bundle-size-diff inspect <package-name>');
      process.exit(1);
    }
    const readPackageContent = (path: string): Promise<Buffer> => readFile(resolve('./packages', packageName, path));
    try {
      const cjs = await readPackageContent('./dist/cjs/index.js');
      const esm = await readPackageContent('./dist/esm/index.js');
      const cjsDts = await readPackageContent('./dist/cjs/index.d.ts');
      const esmDts = await readPackageContent('./dist/esm/index.d.ts');
      const packageJson = await readPackageContent('./package.json');
      const license = await readPackageContent('./LICENSE').catch(() => {
        console.warn('Warning: LICENSE not found. skipping...');
        return Buffer.from('');
      });
      const readme = await readPackageContent('./README.md').catch(() => {
        console.warn('Warning: README.md not found. skipping...');
        return Buffer.from('');
      });
      console.log([
        cjs.byteLength,
        esm.byteLength,
        [ cjs, esm, cjsDts, esmDts, packageJson, license, readme ]
          .map(v => v.byteLength)
          .reduce((a, b) => a + b, 0),
      ].join(':'));
    } catch {
      console.error('Error: some of build artifacts not found.');
      process.exit(1);
    }
    break;
  }
  case 'diff':
    exportToMarkdown(getDiff());
    break;

  default:
    console.error('Usage: bundle-size-diff [inspect|diff]');
    process.exit(1);
  }
}


void main();
