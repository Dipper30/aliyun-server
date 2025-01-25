import fs from 'fs';

export const appendLog = async (
  type: 'msg' | 'delete-bucket-file',
  data: string,
) => {
  const filename =
    type === 'delete-bucket-file' ? `logs/cdn-delete.txt` : 'msg.txt';
  if (!fs.existsSync('logs')) {
    try {
      fs.mkdirSync('logs');
    } catch (error) {
      console.error('Failure when creating logs folder ', error);
    }
  }

  fs.appendFile(filename, data + '\n', (err) => {
    // eslint-disable-next-line no-console
    console.error('Failure when logging ', err);
  });
};
