import { useId } from "react";
import { recipes } from "../../game/data";
import { type BakingSession } from "./session";
export const pastryPath = (id: string) =>
  id === "moon"
    ? "M210 220Q175 127 295 115Q240 205 320 267Q430 350 545 180Q570 125 550 105Q665 211 570 304Q413 424 260 315Q222 287 210 220Z"
    : id === "ghost"
      ? "M190 225C190 65 610 65 610 225C610 390 190 390 190 225Z"
      : "M225 235C195 72 600 62 575 235C590 386 205 386 225 235Z";
export function PastryCanvas({
  session: s,
  preparing = false,
  progress = 0,
}: {
  session: BakingSession;
  preparing?: boolean;
  progress?: number;
}) {
  const uid = useId();
  const r = recipes.find((r) => r.id === s.recipeId)!;
  const heat = s.stage === "shape" ? 0 : s.heat;
  const golden = heat >= 40,
    dark = heat > 96;
  const fill = dark ? "#98604a" : golden ? "#e8ab66" : "#f1d8aa";
  const shaped = !preparing || s.shaped === 3;
  return (
    <g
      className="bake-pastry"
      style={{
        transformOrigin: "400px 235px",
        transform: `scale(${1 + progress * 0.025})`,
      }}
    >
      <defs>
        <clipPath id={uid}>
          <path d={pastryPath(r.id)} />
        </clipPath>
        <radialGradient id={`${uid}-dough`}>
          <stop stopColor={golden ? "#ffdb94" : "#fff0cd"} />
          <stop offset="1" stopColor={fill} />
        </radialGradient>
      </defs>
      <ellipse cx="400" cy="333" rx="233" ry="34" fill="#402c352a" />
      {!shaped ? (
        <g>
          <path
            d={
              r.id === "moon"
                ? "M400 110L210 320Q400 360 590 320Z"
                : "M220 130Q400 95 580 130L580 325Q400 360 220 325Z"
            }
            fill="#f2d4a2"
            stroke="#b88b62"
            strokeWidth="4"
          />
          <path
            d={`M280 ${255 - s.shaped * 23}Q400 ${290 - s.shaped * 26} 520 ${255 - s.shaped * 23}`}
            stroke={r.color}
            strokeWidth={30 + s.shaped * 12}
            fill="none"
            strokeLinecap="round"
          />
          {s.shaped > 0 && (
            <path
              d="M220 302Q400 220 580 302L565 330Q400 370 235 330Z"
              fill="#dfbb89"
              stroke="#b88b62"
              strokeWidth="4"
            />
          )}
          {s.shaped > 1 && (
            <path
              d="M240 255Q400 180 560 255L545 290Q400 330 255 290Z"
              fill="#ecd09d"
              stroke="#b88b62"
              strokeWidth="4"
            />
          )}
        </g>
      ) : (
        <>
          <path
            d={pastryPath(r.id)}
            fill={`url(#${uid}-dough)`}
            stroke={dark ? "#714a42" : "#b87e53"}
            strokeWidth="5"
          />
          {r.id === "moon" && (
            <path
              d="M265 202L288 235M325 270L305 305M407 310L407 347M493 277L519 310M554 208L580 235"
              stroke="#b87e53"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {r.id === "cinnamon" && (
            <path
              d="M285 232Q250 130 406 130Q553 136 539 232Q530 316 391 303Q294 294 322 215Q351 157 447 189Q488 213 453 250Q416 280 377 247Q361 226 399 219"
              stroke="#a46e4b"
              strokeWidth="17"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {r.id === "ember" && (
            <path
              d="M290 185Q400 270 510 185M307 285Q400 225 493 285"
              stroke="#bc885c"
              strokeWidth="6"
              fill="none"
            />
          )}
          {r.id === "ghost" && (
            <ellipse
              cx="400"
              cy="225"
              rx="181"
              ry="104"
              fill={r.color}
              stroke="#d6a16c"
              strokeWidth="7"
            />
          )}
          <g clipPath={`url(#${uid})`}>
            {r.id !== "ghost" && (
              <path
                d={
                  r.id === "moon"
                    ? "M247 249Q392 380 563 229"
                    : r.id === "cinnamon"
                      ? "M270 213Q392 343 537 209"
                      : "M275 230Q400 315 525 220"
                }
                fill="none"
                stroke={r.color}
                strokeWidth="14"
                strokeLinecap="round"
                opacity=".8"
              />
            )}
            {s.marks.map((m, i) => (
              <g
                key={i}
                transform={`translate(${m.x} ${m.y}) rotate(${i * 43})`}
              >
                {r.topping === "Star sugar" ? (
                  <path
                    d="M0-11L3-3L12 0L3 4L0 12L-4 3L-12 0L-3-3Z"
                    fill="#fff5bf"
                    stroke="#d5b879"
                    strokeWidth="1.5"
                  />
                ) : r.topping === "Pearls" ? (
                  <circle
                    r="8"
                    fill="#fffcf1"
                    stroke="#c6b3bf"
                    strokeWidth="2"
                  />
                ) : r.topping === "Cinnamon" ? (
                  <g fill="#986044">
                    <circle r="5" />
                    <circle cx="8" cy="7" r="2" />
                    <circle cx="-7" cy="-5" r="3" />
                  </g>
                ) : (
                  <g strokeWidth="4" strokeLinecap="round">
                    <path d="M-8-6L-2 3" stroke="#fff3c5" />
                    <path d="M5-7L9 2" stroke="#f7a5b2" />
                    <path d="M-4 10L3 8" stroke="#c2d8ac" />
                  </g>
                )}
              </g>
            ))}
          </g>
        </>
      )}
    </g>
  );
}
