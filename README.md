# github-hope
Github Projects Evaluator npm package, which used in HOPE

## Installation
```bash
$ npm i --save github-hope
```

## Usage
```javascript
const hope = require('gihub-hope')

hope.evaluate('https://github.com/HackaIran/HOPE.git',someStrategy || null).then(result => {
    
    console.log(result);
//     { quality: '214.29',
//   results:
//    [ general: [ [Object], [Object], [Object], [Object] ],
//      readme: [ [Object],
//        [Object],
//        [Object],
//        [Object],
//        [Object],
//        [Object],
//        [Object],
//        [Object],
//        [Object] ] 
            // ],
//        .
//        .
//        . }

})
```

## Scripts
* `npm run compile` - Compiles source files to disk (~/lib).
* `npm run compile:watch` - Same as `npm run compile` but watches files for changes.
* `npm run lint` - Lints source and test files.
* `npm run lint:fix` - Lints files and attempts to fix any issues.
* `npm run test` - Runs unit tests.
* `npm run test:watch` - Same as `npm test` but watches files for changes.
* `npm run test:cov` - Generates a test coverage report.

## Distribution
Execute one of the following commands
```bash
npm version patch
npm version minor
npm version major
```
## License
ISC
