import { BakeryRoomArt } from "./BakeryRoom";
import type { SceneId } from "../../game/scenes";
import type { Npc } from "../../game/data";
export type Actor = Npc | "customer";
function VillageArt({ scene }: { scene: SceneId }) {
  const library = scene === "library";
  const tower = scene === "tower";
  return (
    <svg
      viewBox="0 0 1400 780"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={
        library
          ? "A candlelit magical library"
          : tower
            ? "An ivy-covered bell tower at dusk"
            : "A whimsical village square under the moon"
      }
    >
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stopColor="#35394f" />
          <stop offset="1" stopColor="#a27d91" />
        </linearGradient>
        <linearGradient id="road" x2="0" y2="1">
          <stop stopColor="#8d7883" />
          <stop offset="1" stopColor="#4b4c5b" />
        </linearGradient>
        <radialGradient id="moonhalo">
          <stop stopColor="#f9ddb0" stopOpacity=".25" />
          <stop offset="1" stopColor="#f9ddb0" stopOpacity="0" />
        </radialGradient>
        <pattern
          id="books"
          width="160"
          height="90"
          patternUnits="userSpaceOnUse"
        >
          <rect width="160" height="90" fill="#403947" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <g key={i}>
              <rect
                x={i * 22 + 5}
                y={10 + (i % 3) * 5}
                width="16"
                height={68 - (i % 3) * 5}
                rx="2"
                fill={["#9a7787", "#8a9c8b", "#b69b78"][i % 3]}
              />
              <path
                d={`M${i * 22 + 8} 27h10M${i * 22 + 8} 65h10`}
                stroke="#e3c6a1"
                strokeWidth="2"
                opacity=".5"
              />
            </g>
          ))}
          <path d="M0 84H160" stroke="#b19380" strokeWidth="10" />
        </pattern>
      </defs>
      <rect width="1400" height="780" fill="url(#sky)" />
      <circle cx="1050" cy="160" r="180" fill="url(#moonhalo)" />
      <circle cx="1050" cy="160" r="57" fill="#f2d6ad" />
      <circle cx="1072" cy="141" r="56" fill="#4c435b" />
      {Array.from({ length: 28 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 173 + 100) % 1400}
          cy={(i * 73 + 31) % 370}
          r={i % 3 === 0 ? 2 : 1}
          fill="#f0d6ae"
          opacity=".6"
        />
      ))}
      <path
        d="M0 450L140 300L240 390L380 255L520 390L720 290L900 420L1110 295L1400 430V780H0Z"
        fill="#444859"
      />
      <path d="M0 550Q700 450 1400 550V780H0" fill="url(#road)" />
      {library ? (
        <>
          <rect x="70" y="40" width="1260" height="560" fill="#4e4353" />
          <path
            d="M685 510V153a124 124 0 0 1 248 0v357Z"
            fill="url(#sky)"
            stroke="#a18b86"
            strokeWidth="16"
          />
          <path d="M809 44V510M685 248H933" stroke="#a18b86" strokeWidth="9" />
          <rect
            x="125"
            y="85"
            width="460"
            height="486"
            fill="url(#books)"
            stroke="#7b6464"
            strokeWidth="18"
          />
          <rect
            x="1010"
            y="85"
            width="270"
            height="486"
            fill="url(#books)"
            stroke="#7b6464"
            strokeWidth="18"
          />
          <path
            d="M529 100L457 617M575 100L503 617M519 160H566M510 215H558M501 270H549M492 325H540M483 380H531M474 435H522M465 490H513M456 545H504"
            stroke="#c0a087"
            strokeWidth="9"
          />
          <ellipse cx="788" cy="605" rx="200" ry="40" fill="#aa8275" />
          <path
            d="M670 607L650 780M907 607L930 780"
            stroke="#6a5059"
            strokeWidth="25"
          />
          <path
            d="M705 578L756 558L814 575L805 607L757 593L711 607Z"
            fill="#e1ccb1"
            stroke="#8d6f6c"
            strokeWidth="3"
          />
          {[690, 965].map((x) => (
            <g key={x}>
              <path d={`M${x} 0V160`} stroke="#a79078" strokeWidth="3" />
              <path d={`M${x - 22} 160h44v48h-44Z`} fill="#e4bc81" />
              <path d={`M${x - 28} 160l28-20 28 20`} fill="#7e6a70" />
              <circle cx={x} cy="185" r="55" fill="url(#moonhalo)" />
            </g>
          ))}
        </>
      ) : (
        <>
          <path d="M100 533V320L220 209L345 320V544" fill="#8d6d79" />
          <path
            d="M75 331L220 185L365 331"
            fill="none"
            stroke="#3e4050"
            strokeWidth="24"
          />
          <path d="M140 531V365H297V540" fill="#bd957e" />
          {[159, 245].map((x) => (
            <g key={x}>
              <path
                d={`M${x} 448v-63a26 26 0 0 1 52 0v63Z`}
                fill="#edbd8a"
                stroke="#725b69"
                strokeWidth="7"
              />
              <path
                d={`M${x + 26} 360V448M${x} 407h52`}
                stroke="#725b69"
                strokeWidth="5"
              />
            </g>
          ))}
          <path d="M1100 560V329L1210 249L1335 330V557" fill="#897286" />
          <path
            d="M1078 337L1208 224L1360 337"
            fill="none"
            stroke="#444353"
            strokeWidth="24"
          />
          <rect
            x="1150"
            y="376"
            width="73"
            height="90"
            rx="35"
            fill="#e1b889"
            stroke="#69576d"
            strokeWidth="8"
          />
          <path d="M1245 493V393a27 27 0 0 1 54 0v100" fill="#594959" />
          <path d="M340 780L650 522H822L1080 780" fill="#aa8d91" opacity=".4" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M${460 - i * 30} ${560 + i * 36}h${410 + i * 60}`}
              stroke="#d0aba0"
              opacity=".2"
              strokeWidth="2"
            />
          ))}
          {tower ? (
            <>
              <path
                d="M530 600L550 114L644 34L741 114L766 600Z"
                fill="#8a8390"
                stroke="#555568"
                strokeWidth="8"
              />
              <path d="M525 128L645 13L766 128" fill="#494759" />
              <path d="M590 298V183a56 56 0 0 1 112 0v115Z" fill="#3c3e51" />
              <path d="M608 250q0-65 38-65q39 0 39 65Z" fill="#c4aa84" />
              <path
                d="M599 252H693M646 252V270"
                stroke="#d1b797"
                strokeWidth="7"
              />
              <path d="M601 600V466a46 46 0 0 1 92 0v134" fill="#454653" />
              <path
                d="M568 520q66-120-9-224q-30-90 10-149M731 578q-55-90 5-162"
                fill="none"
                stroke="#667f71"
                strokeWidth="15"
              />
              {Array.from({ length: 9 }, (_, i) => (
                <ellipse
                  key={i}
                  cx={566 + (i % 2) * 24}
                  cy={166 + i * 39}
                  rx="22"
                  ry="10"
                  transform={`rotate(${i % 2 ? 35 : -35} 570 ${166 + i * 39})`}
                  fill="#859580"
                />
              ))}
              <path
                d="M530 330H750M540 390H755"
                stroke="#aaa09f"
                strokeWidth="6"
              />
            </>
          ) : (
            <>
              <path
                d="M550 594V365Q545 330 572 328Q601 336 594 370V594"
                fill="#b39a97"
              />
              <path
                d="M419 365Q450 190 578 197Q705 205 734 365Z"
                fill="#a58295"
                stroke="#735f78"
                strokeWidth="6"
              />
              {[
                [490, 302, 20],
                [569, 241, 25],
                [655, 313, 26],
                [570, 338, 15],
              ].map(([x, y, r]) => (
                <ellipse
                  key={x + y}
                  cx={x}
                  cy={y}
                  rx={r}
                  ry={r * 0.6}
                  fill="#e0c0ae"
                  opacity=".8"
                />
              ))}
              <ellipse cx="820" cy="585" rx="100" ry="28" fill="#8e9a98" />
              <path
                d="M736 584L757 626Q817 648 886 626L906 584"
                fill="#727d82"
              />
              <path d="M804 573V476H834V573" fill="#a6ada6" />
              <ellipse cx="819" cy="478" rx="46" ry="12" fill="#bbc0ab" />
              <path
                d="M819 478q-30-80 0-95q30 15 0 95"
                fill="#a4bfba"
                opacity=".7"
              />
              <path
                d="M365 585V460M340 471H424L409 445H340"
                stroke="#bca18c"
                strokeWidth="8"
              />
            </>
          )}
          <path
            d="M88 577V421M1217 597V501"
            stroke="#4a4858"
            strokeWidth="10"
          />
          {[
            [88, 414],
            [1217, 497],
          ].map(([x, y]) => (
            <g key={x}>
              <path
                d={`M${x - 18} ${y}h36v49h-36Z`}
                fill="#ebc596"
                stroke="#6d5b66"
                strokeWidth="5"
              />
              <path d={`M${x - 24} ${y}l24-22 24 22`} fill="#6d5b66" />
              <circle cx={x} cy={y + 25} r="100" fill="url(#moonhalo)" />
            </g>
          ))}
        </>
      )}
      <path
        d="M0 727Q200 630 337 780H0M1120 780Q1220 651 1400 700V780"
        fill="#35494b"
      />
      {[25, 80, 131, 1225, 1310, 1380].map((x, i) => (
        <path
          key={x}
          d={`M${x} 780q-35-100 5-135q42 23 6 95q58-55 70-22q-5 44-70 62`}
          fill={i % 2 ? "#50655c" : "#65776b"}
        />
      ))}
    </svg>
  );
}
export function CharacterSprite({ actor }: { actor: Actor }) {
  const orin = actor === "orin",
    customer = actor === "customer";
  const skin = orin ? "#a9b9ad" : customer ? "#c7b0d4" : "#cfb4cf";
  return (
    <svg
      className={"character-sprite actor-" + actor}
      viewBox="0 0 420 650"
      role="img"
      aria-label={
        orin
          ? "Orin, a gentle moss-covered gargoyle"
          : customer
            ? "A friendly horned bakery customer"
            : "Lucien, the violet-haired night librarian"
      }
    >
      <defs>
        <linearGradient id={"coat-" + actor} x2="1" y2="1">
          <stop
            stopColor={orin ? "#5a716a" : customer ? "#806d9b" : "#494459"}
          />
          <stop
            offset="1"
            stopColor={orin ? "#344d4d" : customer ? "#4b475f" : "#272f43"}
          />
        </linearGradient>
      </defs>
      {orin && (
        <>
          <path
            d="M129 315Q5 136 8 408L57 376L81 438L113 398L143 449Z"
            fill="#81958c"
            stroke="#5b726b"
            strokeWidth="5"
          />
          <path
            d="M290 315Q415 136 411 408L363 376L338 438L307 398L276 449Z"
            fill="#81958c"
            stroke="#5b726b"
            strokeWidth="5"
          />
          <path
            d="M28 252L113 397M393 252L307 397"
            stroke="#a2afa1"
            strokeWidth="5"
          />
        </>
      )}
      <path
        d="M90 650L77 414Q72 321 155 295L263 292Q345 308 350 408L336 650Z"
        fill={"url(#coat-" + actor + ")"}
        stroke="#293b42"
        strokeWidth="4"
      />
      <path d="M154 293L182 271H237L266 295L212 379Z" fill={skin} />
      <path
        d="M155 295L181 354L211 379L151 393L124 314M265 295L237 354L211 379L274 397L295 317"
        fill={orin ? "#88a18c" : "#75647c"}
        stroke="#414a54"
        strokeWidth="3"
      />
      {!customer && (
        <path d="M211 382L207 650" stroke="#a69788" strokeWidth="2" />
      )}
      {[420, 475, 530, 585].map((y) => (
        <circle key={y} cx="224" cy={y} r="4" fill="#d5bc90" />
      ))}
      <path
        d="M86 419L60 569Q63 600 89 593L146 493"
        fill={skin}
        stroke="#6a7a78"
        strokeWidth="3"
      />
      <path
        d="M331 411L364 560Q359 594 334 580L282 475"
        fill={skin}
        stroke="#6a7a78"
        strokeWidth="3"
      />
      <path
        d="M145 152L123 101Q109 51 133 31Q130 78 166 103M258 113L280 73Q300 31 286 11Q321 32 305 95L279 151"
        fill={orin ? "#858d87" : "#877088"}
        stroke="#4c4d5a"
        strokeWidth="4"
      />
      <path
        d="M143 179L111 161L126 213L147 218M273 179L302 161L286 213L269 218"
        fill={skin}
        stroke="#7f7f88"
        strokeWidth="3"
      />
      <path
        d="M142 139Q146 86 208 87Q277 89 281 151L272 237Q257 280 211 287Q168 277 149 244Z"
        fill={skin}
        stroke="#6b7180"
        strokeWidth="3"
      />
      <path
        d="M137 167Q103 102 166 75Q234 38 277 93Q302 126 280 176L260 139Q215 159 187 112Q180 145 137 167"
        fill={orin ? "#52615e" : customer ? "#685575" : "#62506e"}
      />
      <path
        d="M143 121Q178 79 229 85M161 105Q205 66 250 93M255 105L273 138"
        stroke={orin ? "#708277" : "#8b7396"}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M161 183Q178 172 194 182M226 181Q243 171 258 181"
        stroke="#4e4b59"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M162 196Q178 204 193 195M227 195Q242 204 256 195"
        stroke="#4c4b58"
        strokeWidth="4"
        fill="none"
      />
      <circle cx="180" cy="197" r="4" fill="#3e4a49" />
      <circle cx="241" cy="197" r="4" fill="#3e4a49" />
      <path
        d="M211 192L204 220L215 222"
        stroke="#9a8e9f"
        strokeWidth="3"
        fill="none"
      />
      <path d="M189 241Q212 259 235 240Q218 266 197 251" fill="#8e647e" />
      <path
        d="M197 244L204 251L207 244M224 245L227 251L232 243"
        fill="#fff0d9"
      />
      <ellipse cx="167" cy="225" rx="13" ry="6" fill="#c68f99" opacity=".45" />
      <ellipse cx="252" cy="225" rx="13" ry="6" fill="#c68f99" opacity=".45" />
      {!orin && !customer && (
        <>
          <rect
            x="151"
            y="183"
            width="50"
            height="31"
            rx="12"
            fill="none"
            stroke="#dfc7a0"
            strokeWidth="3"
          />
          <rect
            x="220"
            y="183"
            width="50"
            height="31"
            rx="12"
            fill="none"
            stroke="#dfc7a0"
            strokeWidth="3"
          />
          <path
            d="M201 195Q211 188 220 195"
            stroke="#dfc7a0"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M112 490L187 466L236 556L159 581Z"
            fill="#997a8b"
            stroke="#c3a387"
            strokeWidth="4"
          />
          <path
            d="M122 492L193 474M131 508L200 489"
            stroke="#d8c3ac"
            strokeWidth="3"
          />
          <path
            d="M148 520l13 6-1 19 10-15 15 1-13-11 5-16-14 10-15-7Z"
            fill="#d8c3ac"
          />
          <path d="M245 345l-8 16 12 9 11-14Z" fill="#c5a57c" />
        </>
      )}
      {orin && (
        <>
          <path
            d="M149 333q-37-38-42-7q14 23 42 7q-11-36 16-40q20 19-16 40"
            fill="#94ab7b"
          />
          <circle cx="130" cy="325" r="8" fill="#d6bf9a" />
          <path
            d="M259 151l-11 14 15 8M157 243l12-6 5 16"
            fill="none"
            stroke="#81948a"
            strokeWidth="3"
          />
          <path d="M264 102q-25-26-34-2q8 19 34 2" fill="#8da17d" />
        </>
      )}
      {customer && (
        <>
          <path d="M126 347L155 381H269L292 345L309 650H108Z" fill="#e0cdb7" />
          <path d="M151 443H269V519Q210 546 151 519Z" fill="#ccb59f" />
          <path d="M210 465l-9 17 13 14 12-17Z" fill="#a389ae" />
        </>
      )}
      <path
        d="M94 453L118 420M312 420L335 453"
        stroke="#afaa9b"
        strokeWidth="3"
        opacity=".5"
      />
    </svg>
  );
}
export function SceneStage({
  scene,
  actor,
}: {
  scene: SceneId;
  actor?: Actor;
}) {
  return (
    <div className={"scene-stage scene-" + scene}>
      <div className="scene-backdrop" key={scene}>
        {scene === "bakery" ? <BakeryRoomArt /> : <VillageArt scene={scene} />}
      </div>
      <div className="scene-vignette" />
      {actor && <CharacterSprite key={actor} actor={actor} />}
      <div className="ambient-motes" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <i
            key={i}
            style={{ left: `${12 + i * 15}%`, animationDelay: `${i * 1.7}s` }}
          />
        ))}
      </div>
    </div>
  );
}
