export interface IAuthority {
  name?: string | null;
}

export const defaultValue: Readonly<IAuthority> = {
  name: '',
};
