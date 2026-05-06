import bcrypt from 'bcrypt';

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
}

export { hashPassword };
