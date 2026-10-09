import {execFileSync, spawnSync} from 'node:child_process';
import {appendFileSync} from 'node:fs';

const branch = process.env.GITHUB_REF_NAME;
if (!branch || !process.env.GITHUB_OUTPUT) throw new Error('Missing workflow branch or output file');
const git = (...args) => execFileSync('git', args, {encoding: 'utf8'}).trim();
const output = value => appendFileSync(process.env.GITHUB_OUTPUT, `publish=${value}\n`);
const base = git('rev-parse', 'HEAD');
function remoteHead() {
  git('fetch', '--no-tags', '--depth=1', 'origin', branch);
  return git('rev-parse', 'FETCH_HEAD');
}
function superseded() {
  console.log('::notice::A newer change is on the branch. Its publishing run will deploy the latest site.');
  output(false);
}

if (remoteHead() !== base) {
  superseded();
} else {
  git('config', 'user.name', 'Chicken Balls release updater');
  git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com');
  git('add', '*.html', '*.css', 'latest-release.json', 'latest-release.js', 'catalog.json', 'catalog.js', 'artwork.js', 'assets/artwork/', 'audio-upload-manifest.json', 'audio-import-audit.json', 'audio-import-audit.csv', 'assets/audio/drive-archive/');
  const diff = spawnSync('git', ['diff', '--cached', '--quiet']);
  if (diff.status === 0) {
    output(process.env.GITHUB_EVENT_NAME !== 'schedule');
  } else if (diff.status === 1) {
    git('add', 'release-sync-status.json');
    git('commit', '-m', 'Refresh latest release metadata');
    const commit = git('rev-parse', 'HEAD');
    const pushed = spawnSync('git', ['push', 'origin', `HEAD:refs/heads/${branch}`], {stdio: 'inherit'});
    if (pushed.status === 0) {
      output(true);
    } else {
      // A commit can arrive between the initial check and push. Never overwrite it.
      const current = remoteHead();
      if (current === commit) output(true);
      else if (current !== base) superseded();
      else throw new Error('Release metadata push failed; remote branch has not advanced');
    }
  } else {
    throw new Error('Could not inspect staged release metadata');
  }
}
