//通过变量名匹配对应的类型
export type ElementIdToType<T extends string> = 
  T extends `${string}Input` ? HTMLInputElement :
  T extends `${string}Textarea` ? HTMLTextAreaElement :
  T extends `${string}Btn` ? HTMLButtonElement :
  T extends `${string}Select` ? HTMLSelectElement :
  T extends `${string}Checkbox` ? HTMLInputElement :
  T extends `${string}Radio` ? HTMLInputElement :
  T extends `${string}Form` ? HTMLFormElement :
  T extends `${string}Img` ? HTMLImageElement :
  T extends `${string}A` ? HTMLAnchorElement :
  T extends `${string}Ul` ? HTMLUListElement :
  T extends `${string}Ol` ? HTMLOListElement :
  T extends `${string}Div` ? HTMLDivElement :
  T extends `${string}Title` | `${string}Heading` | `${string}H1` | `${string}H2` 
  | `${string}H3` | `${string}H4` | `${string}H5` | `${string}H6` ? HTMLHeadingElement :
  T extends `${string}Label` ? HTMLLabelElement :
  HTMLElement;