const got = require('got');
const {CookieJar} = require('tough-cookie');
const FormData = require('form-data');
const fs = require('fs');
const ini = require('ini');
const path = require('path');

const args = require('gar')(process.argv.slice(2))
const config = ini.parse(fs.readFileSync(`${__dirname}/config.ini`, 'utf8')).auth;

(async () => {
  if (!args._) {
    printUsage();
  }

  const cookieJar = new CookieJar();

  let form = new FormData();
  form.append('username', config.username);
  form.append('password', config.password);

	await got.post('https://gonic.w00t.cloud/admin/login_do', {
    cookieJar,
    body: form,
  });

  console.log('Successfully logged in!');

  switch(args._[0]) {
    case 'scan':
      await got.get('https://gonic.w00t.cloud/admin/start_scan_do', {
        cookieJar,
      });
      break;

    case 'import':
      for (let i = 1; i < args._.length; i++) {
        console.log(`Importing ${args._[i]}`)
        form = new FormData();
        form.append('playlist-files', fs.createReadStream(args._[i]), {
          contentType: 'audio/x-mpegurl'
        });

        await got.post('https://gonic.w00t.cloud/admin/upload_playlist_do', {
          cookieJar,
          body: form,
        });
      }
      break;

    default:
      printUsage();
  }
})();

function printUsage() {
  console.log(`
${path.basename(process.argv[1])} <command>

commands:
  scan      Perform a library scan
  import    Import playlist m3u8 file

`);

process.exit();
}
