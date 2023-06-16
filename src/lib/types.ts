
export interface Directory {
  name: string;
  fullPath: string;
  selected: boolean;
  children: Array<Directory>;
}

export interface UserOption {
  name: string;
  value: string;
}
