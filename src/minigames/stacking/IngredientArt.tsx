import type { Ingredient } from "./ingredients";
export function IngredientShape({ ingredient: i }: { ingredient: Ingredient }) {
  const fill = (n: number) =>
    i.name === "Ember apple"
      ? "#f1ca90"
      : i.name === "Crescent"
        ? "#efbf83"
        : i.name === "Tart"
          ? n === 0
            ? "#d59b63"
            : "#eec998"
          : i.name === "Roll"
            ? n === 0
              ? "#cb925e"
              : "#edbd81"
            : i.name === "Bun"
              ? "#e8b57a"
              : i.name === "Sugar sprinkles"
                ? ["#f1c59d", "#b9d5c6", "#e3a5c3", "#fff0c0"][n % 4]
                : i.color;
  const stroke =
    i.category === "base"
      ? "#ac754e"
      : i.name === "Ember apple"
        ? "#c87c5c"
        : i.name === "Moonberry"
          ? "#81558f"
          : i.name === "Vanilla cloud"
            ? "#c8b391"
            : i.name === "Cinnamon icing"
              ? "#a46d50"
              : i.name === "Pearls"
                ? "#b9a0c8"
                : i.name === "Star sugar"
                  ? "#cba15f"
                  : "none";
  return (
    <g>
      {i.contours.map((points, n) => (
        <polygon
          key={n}
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill={fill(n)}
          stroke={stroke}
          strokeWidth={
            i.category === "base" ? 2 : i.name === "Ember apple" ? 3 : 1.2
          }
          strokeLinejoin="round"
        />
      ))}
      {i.name === "Crescent" && (
        <path
          d="M-63-12L-50 17M-30 11L-34 30M6 15L12 33M45 3L61 21"
          stroke="#bf895b"
          strokeWidth="4"
        />
      )}
      {i.name === "Roll" && (
        <path
          d="M-55-2Q-55-33 3-27Q57-22 55-5Q50 14 2 9Q-34 6-31-9Q-25-22 5-16Q27-12 21-4Q16 1 0-3"
          fill="none"
          stroke="#a76e48"
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}
      {i.name === "Tart" && (
        <>
          <ellipse cy="-12" rx="67" ry="13" fill="#c89868" />
          {[-60, -30, 0, 30, 60].map((x) => (
            <path key={x} d={`M${x} 10v20`} stroke="#b47e52" strokeWidth="3" />
          ))}
        </>
      )}
      {i.name === "Bun" && (
        <>
          <path
            d="M-48-7Q-17-42 15-18M-9-10Q27-34 53-7"
            fill="none"
            stroke="#c58d5e"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M-66 18Q0 39 66 17"
            stroke="#f6d39e"
            strokeWidth="3"
            fill="none"
          />
        </>
      )}
      {i.name === "Moonberry" && (
        <>
          <ellipse cx="-22" cy="-3" rx="9" ry="3" fill="#d4a3df" />
          <ellipse cx="20" cy="-5" rx="6" ry="3" fill="#d4a3df" />
        </>
      )}
      {i.name === "Vanilla cloud" && (
        <path
          d="M-28-3Q-3 13 25-4"
          fill="none"
          stroke="#daccae"
          strokeWidth="3"
        />
      )}
      {i.name === "Cinnamon icing" && (
        <path
          d="M-39-2Q-22 7-9-2M8-2Q22 6 38-1"
          fill="none"
          stroke="#ebc8a0"
          strokeWidth="3"
        />
      )}
      {i.name === "Pearls" &&
        [-31, -15, 2, 20, 35].map((x, j) => (
          <circle
            key={x}
            cx={x - 2}
            cy={(j % 2 ? -5 : 2) - 3}
            r="2"
            fill="#fff5f3"
          />
        ))}
      {i.name === "Cinnamon" &&
        Array.from({ length: 18 }, (_, j) => (
          <circle
            key={j}
            cx={-37 + ((j * 19) % 74)}
            cy={-5 + ((j * 7) % 12)}
            r="1.6"
            fill={j % 2 ? "#e4b87f" : "#875637"}
          />
        ))}
    </g>
  );
}
export function IngredientIcon({ ingredient }: { ingredient: Ingredient }) {
  return (
    <svg viewBox="-110 -58 220 116" aria-hidden="true">
      <IngredientShape ingredient={ingredient} />
    </svg>
  );
}
