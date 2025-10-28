const bcrypt = require('bcryptjs');

const passwords = {
  'admin123': null,
  'song1234': null,
};

async function generateHashes() {
  console.log('生成密码哈希...\n');
  
  for (const [password, _] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    passwords[password] = hash;
    console.log(`密码: ${password}`);
    console.log(`哈希: ${hash}\n`);
  }
}

generateHashes().catch(console.error);

