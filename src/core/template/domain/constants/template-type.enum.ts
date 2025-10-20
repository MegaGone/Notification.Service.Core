export enum TEMPLATE_TYPE_ENUM {
  SMS = 2,
  EMAIL = 1,
}

export const TEMPLATE_TYPE_RECORD: Record<number, boolean> = {
  [TEMPLATE_TYPE_ENUM.SMS]: true,
  [TEMPLATE_TYPE_ENUM.EMAIL]: true,
} as const;
