import bcrypt from 'bcrypt';

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
}


async function comparePassword(plainPass, hashedPass) {
  const isMatched = await bcrypt.compare(plainPass, hashedPass);

  return isMatched;
} 

export { hashPassword, comparePassword };
