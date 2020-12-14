import fs from 'fs';
import glob = require('glob');
import path from 'path';
import { Parser } from '../src';

const parser = new Parser();

const testsPath = path.join(__dirname, 'resource', 'valid');

const files = glob
  .sync('./**/*.ftl', {
    cwd: testsPath,
    nodir: true,
    absolute: true,
  })
  .map((file) => [path.basename(file), file]);

describe.each(files)('%s', (_, file) => {
  const template = fs.readFileSync(file, 'utf8');
  const data = parser.parse(template);

  it('should have no errors', () => {
    expect(data.ast.errors).toBeFalsy();
  });

  it('should have correct tokens', () => {
    expect(data.tokens).toMatchSnapshot();
  });

  it('should have correct ast', () => {
    expect(data.ast).toMatchSnapshot();
  });
});
