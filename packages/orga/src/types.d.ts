interface Range {
  start: number;
  end: number;
}

interface Point {
  line: number;
  column: number;
}

interface Position {
  start: Point;
  end: Point;
}

interface Token {
  name: string;
  position: Position;
  data?: any;
}

