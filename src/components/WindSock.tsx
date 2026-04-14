import React from 'react';
import { View } from 'react-native';
import Svg, {
  Line,
  Path,
  G,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

interface Props {
  speedKnots: number;
  directionDeg: number; // meteorological: where wind comes FROM
  size?: number;
}

/**
 * Windsock rules (matching the reference image):
 *
 * - The sock's MOUTH opens INTO the wind (faces the wind origin)
 * - The sock's TAIL points DOWNWIND (wind_direction + 180°)
 * - More speed → sock lifts from drooping vertical toward horizontal (flat)
 *
 * Elevation angle from HORIZONTAL:
 *   0  kts → 85° (hanging straight down, nearly vertical)
 *   10 kts → 45°
 *   18+kts → 5°  (almost fully horizontal / flat)
 *
 * Screen rotation:
 *   Compass 0° = North = SVG "up" (−Y)
 *   Sock tail compass direction = directionDeg + 180°
 *   SVG rotates clockwise, so SVG_rotation = tailCompass
 *   (SVG 0° = up = North, positive = clockwise)
 */
export default function WindSock({ speedKnots, directionDeg, size = 110 }: Props) {
  // ── Elevation droop ─────────────────────────────────────────
  // 0 kts → 85° below horizontal, 20+ kts → 5° below horizontal
  const clampedSpeed = Math.min(speedKnots, 22);
  const elevationDeg = 85 - (clampedSpeed / 22) * 80; // degrees below horizontal

  // ── Direction: sock tail points downwind ────────────────────
  const tailCompassDeg = (directionDeg + 180) % 360;
  // Convert compass (0=N, clockwise) → SVG rotation (0=up, clockwise) — same mapping
  const svgRotationDeg = tailCompassDeg;

  // ── Geometry (in a local coord system, rotated later) ───────
  // Origin = top of pole (attachment point of sock mouth)
  // Sock extends along the positive-X axis, then droops by elevationDeg

  const sockLength = size * 0.42;
  const mouthH     = size * 0.18; // mouth half-height
  const tailH      = size * 0.06; // tail half-height

  // Droop the sock: tip is at angle elevationDeg BELOW the horizontal
  const rad = (elevationDeg * Math.PI) / 180;
  const tipX = sockLength * Math.cos(rad);
  const tipY = sockLength * Math.sin(rad); // positive Y = downward in SVG

  // Sock outline: trapezoid (mouth top → tip top → tip bottom → mouth bottom)
  const mouthTop    = `${0},${-mouthH}`;
  const mouthBottom = `${0},${mouthH}`;
  const tipTop      = `${tipX},${tipY - tailH}`;
  const tipBottom   = `${tipX},${tipY + tailH}`;

  // Stripes: 4 bands inside the sock (alternating red/white like a real windsock)
  const stripes = 4;
  const stripeData: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
  for (let s = 1; s < stripes; s++) {
    const t = s / stripes; // 0..1 along sock length
    const sx = tipX * t;
    const sy = tipY * t;
    // Width at this t: lerp from mouthH to tailH
    const hw = mouthH + (tailH - mouthH) * t;
    stripeData.push({
      x1: sx,
      y1: sy - hw,
      x2: sx,
      y2: sy + hw,
      color: s % 2 === 0 ? '#CC0000' : '#FFFFFF',
    });
  }

  // Canvas centre
  const cx = size / 2;
  const cy = size * 0.28; // pole top is at ~28% from top so pole fits below

  const poleTopY    = cy;
  const poleBottomY = size * 0.92;
  const poleX       = cx;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="sockGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#CC0000" stopOpacity="1" />
            <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#CC0000" stopOpacity="1" />
            <Stop offset="0.75" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="1" stopColor="#CC0000" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Pole */}
        <Line
          x1={poleX} y1={poleTopY}
          x2={poleX} y2={poleBottomY}
          stroke="#888"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Pole base disc */}
        <Circle cx={poleX} cy={poleBottomY} r={5} fill="#888" />

        {/* Sock group — rotated around pole top to show wind direction */}
        <G
          origin={`${poleX}, ${poleTopY}`}
          rotation={svgRotationDeg}
        >
          {/* Sock body */}
          <Path
            d={`M ${mouthTop} L ${tipTop} L ${tipBottom} L ${mouthBottom} Z`}
            fill="url(#sockGrad)"
            opacity={0.92}
            transform={`translate(${poleX}, ${poleTopY})`}
          />

          {/* Stripe dividers */}
          {stripeData.map((sd, idx) => (
            <Line
              key={idx}
              x1={poleX + sd.x1} y1={poleTopY + sd.y1}
              x2={poleX + sd.x2} y2={poleTopY + sd.y2}
              stroke={sd.color}
              strokeWidth={1.5}
              opacity={0.6}
            />
          ))}

          {/* Mouth ring */}
          <Line
            x1={poleX} y1={poleTopY - mouthH}
            x2={poleX} y2={poleTopY + mouthH}
            stroke="#CC0000"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </G>

        {/* Mounting ring at pole top */}
        <Circle cx={poleX} cy={poleTopY} r={4} fill="#555" />
      </Svg>
    </View>
  );
}
