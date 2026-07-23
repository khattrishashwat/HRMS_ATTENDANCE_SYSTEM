export type DropdownOption<T extends string = string> = {
  label: string;
  value: T;
};

export type FilterFieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  options: DropdownOption[];
};

export type FilterValues = Record<string, string>;
