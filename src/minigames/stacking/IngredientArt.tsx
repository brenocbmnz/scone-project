import type { Ingredient } from "./ingredients";
export function IngredientShape({ ingredient: i }: { ingredient: Ingredient }) {
  const w = i.width,
    h = i.height;
  if (i.category === "base") {
    if (i.name === "Crescent")
      return (
        <g>
          <path
            d="M-93 13Q-96-15-68-27Q-48-36-28-26Q-10-45 15-33Q37-37 55-20Q82-22 93 6Q97 26 65 30Q-5 43-65 29Q-88 27-93 13Z"
            fill="#efbf83"
            stroke="#a86f4b"
            strokeWidth="3"
          />
          <path
            d="M-63-12L-50 17M-30 11L-34 30M6 15L12 33M45 3L61 21"
            stroke="#bf895b"
            strokeWidth="4"
          />
        </g>
      );
    if (i.name === "Tart")
      return (
        <g>
          <path
            d="M-84-10L-73 26Q0 45 74 26L85-10"
            fill="#d59b63"
            stroke="#ad744e"
            strokeWidth="3"
          />
          <ellipse
            cy="-10"
            rx="85"
            ry="21"
            fill="#eec998"
            stroke="#bd8759"
            strokeWidth="3"
          />
          <ellipse cy="-12" rx="67" ry="13" fill="#c89868" />
          {[-60, -30, 0, 30, 60].map((x) => (
            <path key={x} d={`M${x} 10v20`} stroke="#b47e52" strokeWidth="3" />
          ))}
        </g>
      );
    if (i.name === "Roll")
      return (
        <g>
          <path
            d="M-77-7L-73 22Q0 49 73 22L77-7"
            fill="#cb925e"
            stroke="#ac754e"
            strokeWidth="3"
          />
          <ellipse
            cy="-8"
            rx="77"
            ry="27"
            fill="#edbd81"
            stroke="#ac754e"
            strokeWidth="3"
          />
          <path
            d="M-55-2Q-55-33 3-27Q57-22 55-5Q50 14 2 9Q-34 6-31-9Q-25-22 5-16Q27-12 21-4Q16 1 0-3"
            fill="none"
            stroke="#a76e48"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
      );
    return (
      <g>
        <path
          d="M-78 12Q-82-40 0-42Q84-39 79 12Q65 45 0 40Q-61 43-78 12"
          fill="#e8b57a"
          stroke="#ac754e"
          strokeWidth="3"
        />
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
      </g>
    );
  }
  if (i.category === "filling") {
    if (i.name === "Ember apple")
      return (
        <g>
          {[-31, 0, 30].map((x, index) => (
            <g
              key={x}
              transform={`translate(${x} ${index % 2 ? -5 : 0}) rotate(${index * 12 - 12})`}
            >
              <path
                d="M-24-9Q-2 22 24-9L17-15Q0 2-16-15Z"
                fill="#f1ca90"
                stroke="#c87c5c"
                strokeWidth="4"
              />
            </g>
          ))}
        </g>
      );
    if (i.name === "Vanilla cloud")
      return (
        <g>
          <path
            d="M-51 10Q-64-3-40-13Q-41-25-15-19Q-5-36 14-19Q42-24 43-10Q66-1 49 13Q3 30-51 10"
            fill="#f3e7c8"
            stroke="#c8b391"
            strokeWidth="2"
          />
          <path
            d="M-28-3Q-3 13 25-4"
            fill="none"
            stroke="#daccae"
            strokeWidth="3"
          />
        </g>
      );
    if (i.name === "Cinnamon icing")
      return (
        <g>
          <path
            d="M-50-3Q-40-15-23-7Q-9-17 9-5Q28-16 48-3L50 5Q35 17 29 3Q13 16 3 6Q-15 14-24 2Q-43 15-50-3"
            fill="#cc9a77"
            stroke="#a46d50"
            strokeWidth="2"
          />
          <path
            d="M-39-2Q-22 7-9-2M8-2Q22 6 38-1"
            fill="none"
            stroke="#ebc8a0"
            strokeWidth="3"
          />
        </g>
      );
    return (
      <g>
        <path
          d="M-52 2Q-49-14-31-10Q-20-22-6-10Q8-25 24-9Q50-17 54 4Q48 20 25 12Q5 25-8 12Q-35 25-52 2"
          fill={i.color}
          stroke="#81558f"
          strokeWidth="2"
        />
        <ellipse cx="-22" cy="-3" rx="9" ry="3" fill="#d4a3df" />
        <ellipse cx="20" cy="-5" rx="6" ry="3" fill="#d4a3df" />
      </g>
    );
  }
  return (
    <g>
      {i.name === "Star sugar" ? (
        [-30, 0, 30].map((x, j) => (
          <path
            key={x}
            transform={`translate(${x} ${j % 2 ? -3 : 1})`}
            d="M0-10L3-3L11-2L5 3L7 11L0 7L-7 11L-5 3L-11-2L-3-3Z"
            fill="#ffe5aa"
            stroke="#cba15f"
            strokeWidth="1.3"
          />
        ))
      ) : i.name === "Pearls" ? (
        [-31, -15, 2, 20, 35].map((x, j) => (
          <g key={x}>
            <circle
              cx={x}
              cy={j % 2 ? -5 : 2}
              r="8"
              fill="#e6d4ed"
              stroke="#b9a0c8"
              strokeWidth="1.5"
            />
            <circle cx={x - 2} cy={(j % 2 ? -5 : 2) - 3} r="2" fill="#fff5f3" />
          </g>
        ))
      ) : i.name === "Sugar sprinkles" ? (
        Array.from({ length: 13 }, (_, j) => (
          <path
            key={j}
            d={`M${-36 + j * 6} ${(j % 3) * 5 - 7}l4 ${j % 2 ? 5 : -4}`}
            stroke={["#f1c59d", "#b9d5c6", "#e3a5c3", "#fff0c0"][j % 4]}
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))
      ) : (
        <>
          <ellipse rx="42" ry="8" cy="2" fill="#b37b51" opacity=".75" />
          {Array.from({ length: 18 }, (_, j) => (
            <circle
              key={j}
              cx={-37 + ((j * 19) % 74)}
              cy={-5 + ((j * 7) % 12)}
              r="1.6"
              fill={j % 2 ? "#e4b87f" : "#875637"}
            />
          ))}
        </>
      )}
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
