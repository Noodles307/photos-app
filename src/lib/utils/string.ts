export function sanitizeFolderName(folderName = ''): string {
  return folderName
      .replace('#', '')
      .replace('&', '-')
      .replace('?', '')
      .replace('/', '-')
      .replace('\\', '-')
      .replace('+', '-')
      .replace('=', '-')
}
