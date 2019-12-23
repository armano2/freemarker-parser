import * as assert from 'assert';
import * as fs from 'fs';
import glob = require('glob');
import * as path from 'path';
import { Parser } from '../src';

const parser = new Parser();

const baseDir = path.join(__dirname, '..');

const testsPath = path.join(__dirname, 'resource', 'valid');

const files = glob.sync('./**/*.ftl', {
  cwd: testsPath,
  nodir: true,
  absolute: true,
});

for (const file of files) {
  describe(path.basename(file), () => {
    const template = fs.readFileSync(file, 'utf8');
    const data = parser.parse(template);

    it('should have no errors', () => {
      if (data.ast.errors) {
        for (const error of data.ast.errors) {
          assert.fail(
            `${error.message}\n\tfile:.\\${path.relative(baseDir, file)}:${
              error.loc
                ? `${error.loc.start.column}:${error.loc.start.line}`
                : '0:0'
            }`,
          );
        }
      }
    });

    it('should have correct tokens', () => {
      expect(data.tokens).toMatchSnapshot();
    });

    it('should have correct ast', () => {
      expect(data.ast).toMatchSnapshot();
    });
  });
}
