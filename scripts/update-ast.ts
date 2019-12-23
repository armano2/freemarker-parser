import fs = require('fs');
import glob = require('glob');
import path = require('path');
import { Parser } from '../src';

const parser = new Parser();

const testsPath = path.join(__dirname, '..', 'test', 'resource');

function stringify(text: any) {
  return JSON.stringify(text, null, 2);
}

glob(
  './**/*.ftl',
  { cwd: testsPath, nodir: true, absolute: true },
  (e, files) => {
    if (e) {
      throw e;
    }
    for (const file of files) {
      fs.readFile(file, 'utf8', (err, template) => {
        if (err) {
          throw err;
        }
        const dirname = path.dirname(file);
        const basename = path.basename(file).replace(path.extname(file), '');

        // tslint:disable-next-line:no-console
        console.log(`Updating data ${basename}`);
        // tslint:disable-next-line:no-console
        console.log(' file:', path.relative(testsPath, file));

        const data = parser.parse(template);
        fs.writeFileSync(
          path.join(dirname, `${basename}-tokens.json`),
          stringify(data.tokens),
        );
        fs.writeFileSync(
          path.join(dirname, `${basename}-ast.json`),
          stringify(data.ast),
        );
      });
    }
  },
);
