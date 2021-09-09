// Types which don't belong anywhere in particular.

// From: https://github.com/Microsoft/TypeScript/issues/1897#issuecomment-822032151
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
