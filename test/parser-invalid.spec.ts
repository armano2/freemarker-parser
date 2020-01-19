import fs from 'fs';
import glob = require('glob');
import path from 'path';
import { Parser } from '../src';

const parser = new Parser();

const testsPath = path.join(__dirname, 'resource', 'invalid');

const files = glob.sync('./**/*.ftl', {
  cwd: testsPath,
  nodir: true,
  absolute: true,
});

for (const file of files) {
  describe(path.basename(file), () => {
    const template = fs.readFileSync(file, 'utf8');
    const data = parser.parse(template);

    it('should have errors', () => {
      expect(data.ast.errors).toBeTruthy();
      expect(data.ast.errors).toMatchSnapshot();
    });

    it('should have correct tokens', () => {
      expect(data.tokens).toMatchSnapshot();
    });

    it('should have correct ast', () => {
      expect(data.ast).toMatchSnapshot();
    });
  });
}
