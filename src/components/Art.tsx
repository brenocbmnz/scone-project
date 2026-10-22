export function BakeryArt() {
  return (
    <svg
      className="bakery-art"
      viewBox="0 0 1000 570"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A cozy magical bakery with a glowing oven, hanging herbs, and crescent pastries"
    >
      <defs>
        <linearGradient id="wall" x2="0" y2="1">
          <stop stopColor="#505367" />
          <stop offset="1" stopColor="#343b50" />
        </linearGradient>
        <linearGradient id="glass" x2="0" y2="1">
          <stop stopColor="#e8b98e" />
          <stop offset="1" stopColor="#b96e70" />
        </linearGradient>
        <radialGradient id="fire">
          <stop stopColor="#ffdc90" />
          <stop offset=".5" stopColor="#ed9d64" />
          <stop offset="1" stopColor="#ae5d55" />
        </radialGradient>
        <pattern
          id="floor"
          width="100"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <rect width="100" height="48" fill="#88716f" />
          <path d="M0 0H100V48H0Z M50 0V48" stroke="#6c595e" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1000" height="570" fill="url(#wall)" />
      <path d="M0 0H1000V35H0z" fill="#303343" />
      <path d="M0 60L1000 60M0 300H1000" stroke="#5b5968" strokeWidth="4" />
      <path d="M55 0V410M945 0V410" stroke="#766268" strokeWidth="19" />
      <rect y="416" width="1000" height="154" fill="url(#floor)" />
      <path d="M0 416H1000" stroke="#b19287" strokeWidth="6" />
      <path
        d="M105 270V151a99 99 0 0 1 198 0V270Z"
        fill="#272f45"
        stroke="#927986"
        strokeWidth="10"
      />
      <path d="M117 263V153a86 86 0 0 1 173 0V263Z" fill="#b1a5bf" />
      <path d="M204 63V266M112 165H294" stroke="#676078" strokeWidth="7" />
      <circle cx="247" cy="111" r="25" fill="#f6d9ad" />
      <circle cx="259" cy="102" r="25" fill="#b1a5bf" />
      <path d="M118 246L154 208L181 232L229 195L291 249" fill="#737990" />
      <rect x="91" y="269" width="227" height="17" rx="5" fill="#9a7b7d" />
      <path d="M107 286L112 306H292L300 286" fill="#51444f" />
      <rect
        x="365"
        y="105"
        width="263"
        height="120"
        rx="3"
        fill="#303746"
        stroke="#8c7476"
        strokeWidth="8"
      />
      <path d="M365 163H629" stroke="#8c7476" strokeWidth="8" />
      {[389, 431, 478, 534, 584].map((x, i) => (
        <g key={x}>
          <rect
            x={x}
            y={i % 2 ? 174 : 122}
            width="28"
            height="37"
            rx="6"
            fill={["#c3a4b9", "#b7bea0", "#cfb188"][i % 3]}
          />
          <rect
            x={x + 2}
            y={i % 2 ? 171 : 119}
            width="24"
            height="7"
            rx="2"
            fill="#9e8178"
          />
          <path
            d={`M${x + 7} ${i % 2 ? 190 : 139}h14`}
            stroke="#f2d6ac"
            strokeWidth="4"
          />
        </g>
      ))}
      <path
        d="M760 0V132M723 0V120M801 0V117"
        stroke="#9c8c75"
        strokeWidth="2"
      />
      {[721, 760, 800].map((x, i) => (
        <g key={x}>
          <path
            d={`M${x} ${105 + i * 4}q-30 25-15 58q25-10 15-58q30 25 18 61q-30-15-18-61`}
            fill={i === 1 ? "#9baa91" : "#7e9384"}
          />
        </g>
      ))}
      <path
        d="M722 404V263a102 102 0 0 1 204 0v141Z"
        fill="#8d7c81"
        stroke="#b39894"
        strokeWidth="7"
      />
      <path
        d="M745 401V284a79 79 0 0 1 158 0v117Z"
        fill="#343342"
        stroke="#665762"
        strokeWidth="9"
      />
      <path d="M759 394V302a65 65 0 0 1 130 0v92Z" fill="url(#fire)" />
      <path
        d="M779 394q-12-40 10-62q-4 22 17 29q5-52 28-65q-2 33 16 46q16-9 17-20q28 48 4 72"
        fill="#ffda91"
      />
      <path d="M760 393H890" stroke="#4b3c45" strokeWidth="10" />
      <path
        d="M735 260L754 249M743 302H723M755 211L772 224M873 213L885 198M901 253L920 246"
        stroke="#c0a4a0"
        strokeWidth="4"
      />
      <rect x="740" y="411" width="171" height="15" rx="4" fill="#a28784" />
      <rect x="160" y="359" width="504" height="146" rx="8" fill="#8b6261" />
      <path
        d="M180 385H642V484H180Z"
        fill="#a3776a"
        stroke="#664e57"
        strokeWidth="3"
      />
      <path d="M337 385V484M492 385V484" stroke="#79575b" strokeWidth="4" />
      {[252, 409, 564].map((x) => (
        <circle key={x} cx={x} cy="409" r="4" fill="#e4c49d" />
      ))}
      <rect x="141" y="343" width="543" height="26" rx="6" fill="#d0a58b" />
      <rect x="147" y="335" width="530" height="11" rx="5" fill="#e1bea0" />
      <path
        d="M188 332V299q0-55 77-55q77 0 77 55v33Z"
        fill="#c4c6c0"
        fillOpacity=".22"
        stroke="#d7c1b0"
        strokeWidth="4"
      />
      <path d="M185 333H347" stroke="#b68a77" strokeWidth="8" />
      {[219, 266, 306].map((x, i) => (
        <g
          key={x}
          transform={`translate(${x} ${302 - (i % 2) * 18}) rotate(-15)`}
        >
          <path d="M-18 4q0-25 31-21q-19 9-8 26q-16 11-23-5" fill="#e9ba7f" />
          <path d="M-12-4L-3 0M-9-11L0-6" stroke="#b68267" strokeWidth="2" />
        </g>
      ))}
      <ellipse cx="452" cy="328" rx="49" ry="8" fill="#b58b79" />
      <path d="M409 303Q412 337 451 336Q489 334 496 303Z" fill="#c4b3cf" />
      <ellipse cx="453" cy="303" rx="44" ry="10" fill="#e0d0d7" />
      <path d="M469 302L489 262" stroke="#b48a6e" strokeWidth="7" />
      <path d="M550 329q-10-45 20-45q35-1 21 45Z" fill="#cda899" />
      <path d="M557 281h26v9h-26" fill="#e1c8b0" />
      <rect x="530" y="320" width="83" height="13" rx="5" fill="#a5b39a" />
      <path d="M660 570V466H1000V570Z" fill="#694d55" />
      <path d="M643 455H1000V479H643Z" fill="#d1aa8d" />
      <ellipse cx="837" cy="451" rx="81" ry="8" fill="#a67c69" />
      {[791, 832, 875].map((x) => (
        <g key={x}>
          <path d={`M${x - 17} 446q-5-29 18-28q22 4 15 28Z`} fill="#e6b581" />
          <path
            d={`M${x - 10} 431q9-10 18 1`}
            stroke="#a77c69"
            strokeWidth="3"
            fill="none"
          />
        </g>
      ))}
      <path d="M465 0v38" stroke="#b89a7a" strokeWidth="3" />
      <path d="M424 73q4-43 42-43q37 0 43 43Z" fill="#b7a287" />
      <ellipse cx="467" cy="74" rx="43" ry="9" fill="#f2d3a1" />
      <path d="M428 78L373 230H562L506 78" fill="#f1c89b" opacity=".045" />
      <g fill="#e9d2ad" opacity=".7">
        <path d="M342 91l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
        <path d="M685 152l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" />
        <circle cx="675" cy="301" r="2" />
        <circle cx="355" cy="251" r="2" />
        <circle cx="649" cy="92" r="2" />
      </g>
      <path d="M20 451Q60 400 89 455L77 488H32Z" fill="#7e8f79" />
      <path d="M40 486H76L70 529H46Z" fill="#c18f79" />
      <path
        d="M38 449q-25-35-8-50q25 8 21 45M64 452q-5-43 16-49q22 22-5 48"
        fill="#98a389"
      />
    </svg>
  );
}
export function Pastry({
  color = "#b29ad8",
  stars = 0,
  variant = "Crescent",
}: {
  color?: string;
  stars?: number;
  variant?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 160"
      className="pastry"
      aria-label={`Your handmade ${variant.toLowerCase()}`}
    >
      <ellipse cx="120" cy="129" rx="90" ry="18" fill="#fff3df" opacity=".7" />
      {variant === "Bun" ? (
        <>
          <path
            d="M45 112Q34 32 120 28Q207 35 198 111Q180 142 120 141Q65 140 45 112"
            fill="#e5ad75"
            stroke="#b9805b"
            strokeWidth="3"
          />
          <path
            d="M64 109Q60 55 122 48Q178 51 178 98Q172 121 124 122Q87 116 91 90Q93 70 124 70Q149 74 145 92"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
          />
        </>
      ) : variant === "Tart" ? (
        <>
          <path
            d="M41 85L50 125Q120 151 191 124L200 83"
            fill="#dba26c"
            stroke="#b9805b"
            strokeWidth="3"
          />
          <ellipse
            cx="120"
            cy="83"
            rx="80"
            ry="43"
            fill="#edc796"
            stroke="#bd8b68"
            strokeWidth="3"
          />
          <ellipse cx="120" cy="79" rx="65" ry="31" fill={color} />
          <path
            d="M67 113L70 133M94 121L95 140M122 125V142M150 121L149 139M177 112L174 132"
            stroke="#b9805b"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <path
            d="M42 103Q23 49 92 29Q55 65 91 96Q126 118 168 86Q185 69 181 48Q229 92 186 119Q105 160 42 103"
            fill="#e9b77c"
            stroke="#b9805b"
            strokeWidth="3"
          />
          <path
            d="M69 47L78 77M91 96L81 115M119 104L119 128M151 98L164 120M174 81L197 91"
            stroke="#bd8b68"
            strokeWidth="4"
          />
          <path
            d="M60 93Q109 129 176 98"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
          />
        </>
      )}
      {Array.from({ length: stars }, (_, i) => (
        <text
          key={i}
          x={65 + ((i * 31) % 120)}
          y={80 + (i % 2) * 25}
          fill="#fff0bd"
          fontSize="22"
        >
          ✦
        </text>
      ))}
    </svg>
  );
}
export function Portrait({ who }: { who: "orin" | "lucien" | "pip" }) {
  const c =
    who === "orin" ? "#91a89c" : who === "lucien" ? "#ba9cc2" : "#b7a2c9";
  return (
    <svg viewBox="0 0 100 100" className="portrait" aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill={c} opacity=".22" />
      <path d="M19 100q1-36 31-36q31 0 32 36" fill={c} />
      <path d="M30 34L21 9L44 27M62 28L80 10L73 42" fill={c} />
      <ellipse cx="51" cy="47" rx="26" ry="30" fill={c} />
      <path
        d="M28 40q-4-33 26-28q24 0 24 31q-19-3-27-17q-9 15-23 14"
        fill="#454153"
      />
      <path
        d="M39 47h4M60 47h4"
        stroke="#343344"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M45 60q7 7 14-1" fill="none" stroke="#554454" strokeWidth="2" />
      <path
        d="M27 84L49 97L75 81"
        fill="none"
        stroke="#e6d6b6"
        strokeWidth="3"
      />
    </svg>
  );
}
