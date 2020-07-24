interface Element extends Node {
  readonly tagName: string;
  properties: object;
}

interface Literal extends Node {
  value: string;
}
