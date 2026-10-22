import { useState } from "react";
import {
  Banknote,
  Flame,
  ChefHat,
  BookOpen,
  DoorOpen,
  BedDouble,
  Heart,
  MousePointer2,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Portrait } from "../Art";
import {
  roomObjects,
  roomRegions,
  type RoomObject,
} from "../../game/bakeryRoom";
import { eligible, type Progress } from "../../game/rules";
const icons = {
  register: Banknote,
  oven: Flame,
  workbench: ChefHat,
  recipes: BookOpen,
  door: DoorOpen,
  bed: BedDouble,
  orin: Heart,
  lucien: Heart,
};
export function BakeryRoomArt() {
  return (
    <svg
      viewBox="0 0 1400 780"
      role="img"
      aria-label="Your bakery: a front door and window on the left, recipe shelves, cash register and mixing counter in the middle, glowing oven, and a bed in the right-hand nook"
    >
      <defs>
        <linearGradient id="room-wall" x2="0" y2="1">
          <stop stopColor="#b9c1b2" />
          <stop offset="1" stopColor="#909f97" />
        </linearGradient>
        <linearGradient id="room-floor" x2="0" y2="1">
          <stop stopColor="#a58777" />
          <stop offset="1" stopColor="#705c58" />
        </linearGradient>
        <linearGradient id="window-light" x2="0" y2="1">
          <stop stopColor="#f4deac" />
          <stop offset="1" stopColor="#c8c79d" />
        </linearGradient>
        <radialGradient id="room-fire">
          <stop stopColor="#ffe4a1" />
          <stop offset=".6" stopColor="#edb073" />
          <stop offset="1" stopColor="#985955" />
        </radialGradient>
        <pattern
          id="brick"
          width="100"
          height="46"
          patternUnits="userSpaceOnUse"
        >
          <rect width="100" height="46" fill="#9e7b73" />
          <path
            d="M0 0H100M0 46H100M50 0V23M0 23H100M25 23V46M75 23V46"
            fill="none"
            stroke="#bc9584"
            strokeWidth="3"
          />
        </pattern>
      </defs>
      <rect width="1400" height="780" fill="#283343" />
      <path d="M40 40H1360V575H40Z" fill="url(#room-wall)" />
      <path d="M40 570H1360L1400 780H0Z" fill="url(#room-floor)" />
      <path d="M0 0L1400 0L1360 77H40Z" fill="#c0a58e" />
      <path d="M40 60H1360V93H40Z" fill="#735e58" />
      <path d="M40 80H1360" stroke="#a58a71" strokeWidth="8" />
      <path d="M1055 89V575M40 560H1360" stroke="#6f625b" strokeWidth="15" />
      <path d="M40 580H1360" stroke="#b69a83" strokeWidth="9" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          d={`M0 ${603 + i * 29}H1400`}
          stroke="#635453"
          strokeWidth="2"
          opacity=".55"
        />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path
          key={i}
          d={`M${40 + i * 180} 580L${-100 + i * 220} 780`}
          stroke="#655751"
          strokeWidth="2"
          opacity=".45"
        />
      ))}
      <path
        d="M75 405V167Q75 129 112 129H226V405Z"
        fill="url(#window-light)"
        stroke="#6f695e"
        strokeWidth="12"
      />
      <path d="M150 131V405M77 255H224" stroke="#f1dfbb" strokeWidth="8" />
      <path
        d="M84 369L110 319L136 354L180 298L222 356V404H84Z"
        fill="#849a82"
        opacity=".8"
      />
      <path d="M68 406H237V422H68Z" fill="#d4ba96" />
      <path d="M83 428L71 567H174L231 428" fill="#efd8a4" opacity=".16" />
      <path
        d="M268 559V195Q268 166 298 166H380V559Z"
        fill="#6d6264"
        stroke="#5b5157"
        strokeWidth="9"
      />
      <path d="M285 201H362V423H285Z" fill="#c4c5ab" />
      <path
        d="M324 201V422M286 277H362M286 351H362"
        stroke="#817467"
        strokeWidth="8"
      />
      <rect x="281" y="440" width="84" height="103" fill="#8b7769" />
      <rect x="345" y="442" width="12" height="28" rx="3" fill="#d6bd87" />
      <path
        d="M306 302H347V332H306Z"
        fill="#ead8b4"
        transform="rotate(-7 326 317)"
      />
      <text x="311" y="321" fill="#766953" fontSize="10" fontFamily="serif">
        OPEN
      </text>
      <path d="M255 568H395L421 607H233Z" fill="#657d7d" />
      <path
        d="M425 202H785V346H425Z"
        fill="#5d5a60"
        stroke="#8e7566"
        strokeWidth="10"
      />
      <path d="M425 278H785" stroke="#ae8e75" strokeWidth="10" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>
          <rect
            x={443 + i * 25}
            y={220 + (i % 2) * 8}
            width="19"
            height={52 - (i % 2) * 8}
            fill={["#a67f91", "#c8b38a", "#7e9991"][i % 3]}
          />
          <path
            d={`M${447 + i * 25} 240h10M${447 + i * 25} 258h10`}
            stroke="#e8d5ac"
            strokeWidth="2"
          />
        </g>
      ))}
      {[650, 698, 747].map((x, i) => (
        <g key={x}>
          <rect
            x={x}
            y="223"
            width="27"
            height="48"
            rx="5"
            fill={i === 0 ? "#c0aa91" : i === 1 ? "#b09ab0" : "#a8b49a"}
          />
          <rect x={x + 2} y="220" width="23" height="7" rx="2" fill="#d5bc9c" />
        </g>
      ))}
      <path d="M458 330L481 294L509 325L543 293L567 330" fill="#dfc29b" />
      <rect x="643" y="299" width="66" height="39" rx="6" fill="#c3aa99" />
      <path d="M714 334Q724 299 748 316Q760 333 745 337" fill="#b3c2b0" />
      <path d="M824 143H1024V567H824Z" fill="url(#brick)" />
      <path
        d="M847 454V336a78 78 0 0 1 156 0v118Z"
        fill="#5b5057"
        stroke="#d1b29b"
        strokeWidth="11"
      />
      <path d="M863 448V342a62 62 0 0 1 124 0v106Z" fill="url(#room-fire)" />
      <path
        d="M886 445q-13-40 12-72q-2 33 22 39q-2-53 21-75q-4 35 19 48q22 35 2 60"
        fill="#ffe1a0"
        className="oven-fire"
      />
      <path d="M842 459H1008V478H842Z" fill="#b6937d" />
      <rect x="866" y="506" width="118" height="48" rx="5" fill="#6d5a5d" />
      <path d="M892 519H959" stroke="#c0a183" strokeWidth="4" />
      <path d="M433 465H809V630H433Z" fill="#97776b" />
      <path
        d="M448 489H792V609H448Z"
        fill="#b08e78"
        stroke="#775f58"
        strokeWidth="3"
      />
      <path d="M568 490V610M687 490V610" stroke="#8b6d60" strokeWidth="4" />
      {[506, 623, 742].map((x) => (
        <circle key={x} cx={x} cy="511" r="4" fill="#e2c492" />
      ))}
      <path d="M415 448H825V476H415Z" fill="#d9bd98" />
      <path d="M419 443H821V452H419Z" fill="#efdab6" />
      <path
        d="M628 425L637 371H709L723 425Z"
        fill="#697b77"
        stroke="#4d5d5c"
        strokeWidth="3"
      />
      <rect x="644" y="379" width="57" height="22" rx="2" fill="#a5c7b1" />
      <text x="657" y="395" fontSize="12" fill="#425c52" fontFamily="monospace">
        25.00
      </text>
      <path
        d="M637 411H709M646 419H702"
        stroke="#d2c4a1"
        strokeWidth="5"
        strokeDasharray="8 4"
      />
      <rect x="622" y="426" width="106" height="16" rx="2" fill="#4d615f" />
      <circle cx="675" cy="434" r="3" fill="#dcca9c" />
      <path d="M741 429Q744 454 775 453Q806 452 811 429Z" fill="#b8afc0" />
      <ellipse cx="776" cy="429" rx="35" ry="8" fill="#ded0cf" />
      <path d="M786 428L806 389" stroke="#a18064" strokeWidth="6" />
      <ellipse cx="494" cy="436" rx="44" ry="7" fill="#b59576" />
      <path
        d="M458 432q-2-26 20-27q23 6 15 27M495 431q-3-31 21-29q24 6 17 30"
        fill="#e6bc83"
      />
      <path d="M468 414l15 9M507 411l16 10" stroke="#bf8f63" strokeWidth="3" />
      <path d="M90 528H382V674H90Z" fill="#9a7c70" />
      <path d="M76 516H395V539H76Z" fill="#d3b28b" />
      <path
        d="M103 511V465q0-63 134-63q133 0 133 63v46Z"
        fill="#e1e0cd"
        fillOpacity=".14"
        stroke="#e7d4b2"
        strokeWidth="5"
      />
      <path d="M105 471H369" stroke="#d5c2a2" strokeWidth="3" />
      {[145, 211, 275, 335].map((x, i) => (
        <g key={x}>
          <path
            d={`M${x - 19} ${492 - (i % 2) * 29}q-9-32 22-32q23 6 15 31Z`}
            fill="#d9a872"
          />
          <path
            d={`M${x - 9} ${476 - (i % 2) * 29}l16 6`}
            stroke="#a77e5b"
            strokeWidth="3"
          />
        </g>
      ))}
      <path
        d="M104 555H363V648H104Z"
        fill="#b48f77"
        stroke="#7f625a"
        strokeWidth="3"
      />
      <path
        d="M1090 232H1325V409H1090Z"
        fill="#777e83"
        stroke="#bca38a"
        strokeWidth="8"
      />
      <path d="M1208 235V406M1090 322H1325" stroke="#bca38a" strokeWidth="7" />
      <circle cx="1264" cy="275" r="28" fill="#e9d3a3" />
      <circle cx="1274" cy="267" r="27" fill="#777e83" />
      <path d="M1081 442H1328V574H1081Z" fill="#8c726b" />
      <path d="M1088 445H1321L1350 562H1071Z" fill="#d6c9bc" />
      <path d="M1097 442H1171L1190 481H1080Z" fill="#f0dec2" />
      <path d="M1174 448H1314L1339 561H1160Z" fill="#9587ab" />
      <path d="M1170 486H1323M1163 523H1331" stroke="#beb0cb" strokeWidth="4" />
      <path d="M1073 562H1350V590H1073Z" fill="#705c5e" />
      <path d="M1087 585V618M1332 585V618" stroke="#654e53" strokeWidth="13" />
      <path d="M1091 141H1332V165H1091Z" fill="#8b7767" />
      <path
        d="M1117 141q-7-36 14-35q25 2 17 35M1183 141V105H1211V141"
        fill="#c4ab88"
      />
      <path
        d="M1125 105q-38-49-12-59q34 22 21 54q22-41 36-21q2 28-36 28"
        fill="#6e8a70"
      />
      <path d="M397 78V168M1016 78V189" stroke="#a88c69" strokeWidth="3" />
      {[
        [397, 168],
        [1016, 189],
      ].map(([x, y]) => (
        <g key={x}>
          <path d={`M${x - 33} ${y}q4-37 33-37q30 0 34 37Z`} fill="#a98e70" />
          <ellipse cx={x} cy={y} rx="34" ry="8" fill="#f3d6a1" />
          <path
            d={`M${x - 30} ${y + 4}l-90 270h240l-90-270`}
            fill="#f5dbac"
            opacity=".035"
          />
        </g>
      ))}
      <path d="M80 108q-2-55 40-40q37 9 22 40Z" fill="#a98568" />
      <path
        d="M95 85q-46-62-18-70q36 16 30 66q19-66 40-44q12 28-29 53"
        fill="#6b866d"
      />
      <ellipse cx="943" cy="659" rx="115" ry="45" fill="#687b78" />
      <ellipse
        cx="943"
        cy="659"
        rx="100"
        ry="34"
        fill="none"
        stroke="#b2a68a"
        strokeWidth="3"
      />
      <path d="M1135 673L1291 673L1329 740H1101Z" fill="#9a837e" opacity=".7" />
    </svg>
  );
}
export function BakeryRoom({
  game,
  onInteract,
}: {
  game: Progress;
  onInteract: (object: RoomObject) => void;
}) {
  const [hover, H] = useState<RoomObject | null>(null);
  const [showLabels, L] = useState(false);
  const keys = (Object.keys(roomObjects) as RoomObject[]).filter(
    (k) =>
      !["orin", "lucien"].includes(k) ||
      game.phase === "free" ||
      (game.phase === "evening" && eligible(game, k as "orin" | "lucien")),
  );
  const primary =
    game.phase === "work" ? "register" : game.phase === "free" ? "door" : "bed";
  const current = hover ?? primary;
  return (
    <section className="bakery-room" aria-label="Interactive bakery">
      <div className="room-caption">
        <span className="eyebrow">THE CRUMB & CAULDRON</span>
        <h1>Your own little corner of the world.</h1>
        <p>
          {game.phase === "work"
            ? game.workStarted
              ? "Your customers are waiting. Pick up where you left off."
              : "The hearth is warm. Open the till when you’re ready."
            : game.phase === "free"
              ? "The sign says CLOSED. The afternoon belongs to you."
              : game.scheduled
                ? `A special morning with ${game.scheduled === "orin" ? "Orin" : "Lucien"} is planned. Rest when you’re ready.`
                : "The village is settling down. Make yourself at home."}
        </p>
      </div>
      <div className={"room-canvas " + (showLabels ? "show-labels" : "")}>
        <BakeryRoomArt />
        {keys.map((key) => {
          const region = roomRegions[key];
          const o = roomObjects[key],
            Icon = icons[key],
            npc = key === "orin" || key === "lucien";
          return (
            <button
              key={key}
              className="room-target"
              style={{
                left: `${region.left}%`,
                top: `${region.top}%`,
                width: `${region.width}%`,
                height: `${region.height}%`,
              }}
              aria-label={
                key === "register"
                  ? game.workStarted
                    ? "Continue work day at cash register"
                    : "Start work day at cash register"
                  : key === "bed"
                    ? "Go to bed"
                    : key === "door"
                      ? "Go outside"
                      : key === "orin"
                        ? game.phase === "evening"
                          ? "I should talk to Orin tomorrow…"
                          : "Talk to Orin"
                        : key === "lucien"
                          ? game.phase === "evening"
                            ? "I should talk to Lucien tomorrow…"
                            : "Talk to Lucien"
                          : `Use ${o.name.toLowerCase()}`
              }
              onPointerEnter={() => H(key)}
              onPointerLeave={() => H(null)}
              onFocus={() => H(key)}
              onBlur={() => H(null)}
              onClick={() => onInteract(key)}
            >
              <span
                className={
                  "room-hotspot hotspot-" +
                  key +
                  (primary === key ? " suggested" : "") +
                  (npc ? " npc-hotspot" : "")
                }
                style={{
                  left: `${((o.x - region.left) / region.width) * 100}%`,
                  top: `${((o.y - region.top) / region.height) * 100}%`,
                }}
              >
                {npc ? <Portrait who={key} /> : <Icon size={19} />}
                <span className="hotspot-label">
                  {o.name}
                  {npc && game.phase === "evening" && (
                    <small>
                      {game.scheduled === key
                        ? "A promise for tomorrow"
                        : "Plan a special morning"}
                    </small>
                  )}
                  {primary === key && (
                    <small>
                      {key === "register"
                        ? game.workStarted
                          ? "Continue service"
                          : "Start work day"
                        : key === "door"
                          ? "Go outside"
                          : "Sleep until tomorrow"}
                    </small>
                  )}
                </span>
                <i />
              </span>
            </button>
          );
        })}
      </div>
      <div className="room-footer">
        <div className="room-description" aria-live="polite">
          <span>{roomObjects[current].name}</span>
          <p>{roomObjects[current].description}</p>
        </div>
        <button
          className={"reveal-hotspots " + (showLabels ? "selected" : "")}
          onClick={() => L((v) => !v)}
          aria-pressed={showLabels}
        >
          <Eye size={16} />
          {showLabels ? "Hide labels" : "Show interactions"}
        </button>
        <span className="room-help">
          <MousePointer2 size={14} />
          Click an object · Tab to explore
        </span>
      </div>
    </section>
  );
}
