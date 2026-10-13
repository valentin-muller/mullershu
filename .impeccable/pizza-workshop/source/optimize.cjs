const fs = require('node:fs');
const path = require('node:path');
const sharp = require('/Users/mullersagent/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(__dirname, '../../..');
const assets = path.join(root, 'blog/pizza-workshop/assets');
(async () => {
  const jobs = [];
  for (const width of [480, 960]) {
    jobs.push(sharp(path.join(__dirname, 'pizza-illustration.png')).resize({width}).webp({quality:83}).toFile(path.join(assets, 'pizza-illustration-' + width + '.webp')));
  }
  for (const [name, widths] of Object.entries({hero:[640,1200],dough:[640,1000],toppings:[640,1000],oven:[640,1000]})) {
    for (const width of widths) jobs.push(sharp(path.join(assets,name + '.jpg')).resize({width,withoutEnlargement:true}).webp({quality:83}).toFile(path.join(assets,name + '-' + width + '.webp')));
  }
  await Promise.all(jobs);
  for (const file of fs.readdirSync(assets).filter(f=>f.endsWith('.webp'))) {
    const metadata = await sharp(path.join(assets,file)).metadata();
    console.log(file, metadata.width + '×' + metadata.height, fs.statSync(path.join(assets,file)).size + ' bytes');
  }
})().catch(error => {console.error(error);process.exitCode=1;});
