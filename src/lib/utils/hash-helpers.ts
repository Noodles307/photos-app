import bcrypt from 'bcrypt';

export async function comparePasswordToHash(password: string | null, hash: string | null): Promise<boolean> {
  return new Promise((resolve) => {
    if (!hash || !password) {
      resolve(false);
      return;
    }
    bcrypt.compare(password, hash, (err, result) => {
      if (err) resolve(false);
      resolve(result);
    });
  });
}

export async function getHashFromPassword(password: string): Promise<string | null> {
  const salt = await bcrypt.genSalt();
  const hash = await generateHash(password, salt);
  return hash
}

function generateHash(password: string, salt: string): Promise<string | null> {
  return new Promise((resolve) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) resolve(null);
      resolve(hash);
    });
  });
}
