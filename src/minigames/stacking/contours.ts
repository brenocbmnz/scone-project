export interface Point {
  x: number;
  y: number;
}
export type Contour = Point[];
const pt = (x: number, y: number): Point => ({ x, y });
function curves(
  start: [number, number],
  segments: [number, number, number, number][],
): Contour {
  const points = [pt(...start)];
  let from = points[0];
  for (const [cx, cy, x, y] of segments) {
    for (let n = 1; n <= 16; n++) {
      const t = n / 16,
        u = 1 - t;
      points.push(
        pt(
          u * u * from.x + 2 * u * t * cx + t * t * x,
          u * u * from.y + 2 * u * t * cy + t * t * y,
        ),
      );
    }
    from = pt(x, y);
  }
  return points;
}
const ellipse = (cx: number, cy: number, rx: number, ry: number): Contour =>
  Array.from({ length: 64 }, (_, n) =>
    pt(
      cx + Math.cos((n / 64) * Math.PI * 2) * rx,
      cy + Math.sin((n / 64) * Math.PI * 2) * ry,
    ),
  );
function transform(
  points: Contour,
  x: number,
  y: number,
  degrees = 0,
): Contour {
  const a = (degrees * Math.PI) / 180;
  return points.map((p) =>
    pt(
      x + p.x * Math.cos(a) - p.y * Math.sin(a),
      y + p.x * Math.sin(a) + p.y * Math.cos(a),
    ),
  );
}
const line = (
  x: number,
  y: number,
  dx: number,
  dy: number,
  r: number,
): Contour => {
  const angle = Math.atan2(dy, dx);
  return [
    ...Array.from({ length: 12 }, (_, n) => {
      const a = angle + Math.PI / 2 + (n / 11) * Math.PI;
      return pt(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }),
    ...Array.from({ length: 12 }, (_, n) => {
      const a = angle - Math.PI / 2 + (n / 11) * Math.PI;
      return pt(x + dx + Math.cos(a) * r, y + dy + Math.sin(a) * r);
    }),
  ];
};
// These contours are used BOTH to draw the ingredient and to find its contacts.
const shapes: Record<string, Contour[]> = {
  Crescent: [
    curves(
      [-93, 13],
      [
        [-96, -15, -68, -27],
        [-48, -36, -28, -26],
        [-10, -45, 15, -33],
        [37, -37, 55, -20],
        [82, -22, 93, 6],
        [97, 26, 65, 30],
        [-5, 43, -65, 29],
        [-88, 27, -93, 13],
      ],
    ),
  ],
  Bun: [
    curves(
      [-78, 12],
      [
        [-82, -40, 0, -42],
        [84, -39, 79, 12],
        [65, 45, 0, 40],
        [-61, 43, -78, 12],
      ],
    ),
  ],
  Roll: [
    [
      pt(-77, -7),
      pt(-73, 22),
      ...curves([-73, 22], [[0, 49, 73, 22]]).slice(1),
      pt(77, -7),
    ],
    ellipse(0, -8, 77, 27),
  ],
  Tart: [
    [
      pt(-84, -10),
      pt(-73, 26),
      ...curves([-73, 26], [[0, 45, 74, 26]]).slice(1),
      pt(85, -10),
    ],
    ellipse(0, -10, 85, 21),
  ],
  Moonberry: [
    curves(
      [-52, 2],
      [
        [-49, -14, -31, -10],
        [-20, -22, -6, -10],
        [8, -25, 24, -9],
        [50, -17, 54, 4],
        [48, 20, 25, 12],
        [5, 25, -8, 12],
        [-35, 25, -52, 2],
      ],
    ),
  ],
  "Vanilla cloud": [
    curves(
      [-51, 10],
      [
        [-64, -3, -40, -13],
        [-41, -25, -15, -19],
        [-5, -36, 14, -19],
        [42, -24, 43, -10],
        [66, -1, 49, 13],
        [3, 30, -51, 10],
      ],
    ),
  ],
  "Cinnamon icing": [
    [
      ...curves(
        [-50, -3],
        [
          [-40, -15, -23, -7],
          [-9, -17, 9, -5],
          [28, -16, 48, -3],
        ],
      ),
      pt(50, 5),
      ...curves(
        [50, 5],
        [
          [35, 17, 29, 3],
          [13, 16, 3, 6],
          [-15, 14, -24, 2],
          [-43, 15, -50, -3],
        ],
      ).slice(1),
    ],
  ],
  "Ember apple": [-31, 0, 30].map((x, i) =>
    transform(
      [
        ...curves([-24, -9], [[-2, 22, 24, -9]]),
        pt(17, -15),
        ...curves([17, -15], [[0, 2, -16, -15]]).slice(1),
      ],
      x,
      i % 2 ? -5 : 0,
      i * 12 - 12,
    ),
  ),
  "Star sugar": [-30, 0, 30].map((x, i) =>
    transform(
      [
        pt(0, -10),
        pt(3, -3),
        pt(11, -2),
        pt(5, 3),
        pt(7, 11),
        pt(0, 7),
        pt(-7, 11),
        pt(-5, 3),
        pt(-11, -2),
        pt(-3, -3),
      ],
      x,
      i % 2 ? -3 : 1,
    ),
  ),
  Pearls: [-31, -15, 2, 20, 35].map((x, i) => ellipse(x, i % 2 ? -5 : 2, 8, 8)),
  "Sugar sprinkles": Array.from({ length: 13 }, (_, i) =>
    line(-36 + i * 6, (i % 3) * 5 - 7, 4, i % 2 ? 5 : -4, 2),
  ),
  Cinnamon: [ellipse(0, 2, 42, 8)],
};
export function contoursFor(name: string, category: string): Contour[] {
  return (
    shapes[name] ??
    shapes[
      category === "base"
        ? "Bun"
        : category === "filling"
          ? "Moonberry"
          : "Cinnamon"
    ]
  );
}
export function contourBounds(contours: readonly Contour[]) {
  const points = contours.flat();
  return {
    left: Math.min(...points.map((p) => p.x)),
    right: Math.max(...points.map((p) => p.x)),
    top: Math.min(...points.map((p) => p.y)),
    bottom: Math.max(...points.map((p) => p.y)),
  };
}
export const rotateContours = (contours: readonly Contour[], angle: number) =>
  contours.map((points) => transform(points, 0, 0, angle));
export function containsPoint(
  contours: readonly Contour[],
  x: number,
  y: number,
): boolean {
  return contours.some((points) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[i],
        b = points[j];
      if (
        a.y > y !== b.y > y &&
        x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
      )
        inside = !inside;
    }
    return inside;
  });
}
