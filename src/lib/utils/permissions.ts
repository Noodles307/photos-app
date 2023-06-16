
export enum PERMISSIONS {
  READ = 1,
  WRITE = 1 << 1,
  DELETE = 1 << 2,
  EDIT = 1 << 3,
}

export function has(permissions = 0, permission: PERMISSIONS) {
  return (permissions & permission) > 0;
}

