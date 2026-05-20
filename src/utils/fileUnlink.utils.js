import { unlink } from 'fs';

function fileUnlink(file) {
  if (!file) return;
  unlink(file, err => {
    if (err) console.error(`failed to delete ${file}`);
  });
}

export { fileUnlink };
