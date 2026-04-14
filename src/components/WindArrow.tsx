import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

interface Props {
  speedKnots: number;
  directionDeg: number; // meteorological: where wind comes FROM
  color?: string;
  size?: number;
}

/**
 * Bold directional arrow showing wind direction and speed.
 *
 * The arrowhead points TO where the wind is blowing (downwind).
 * downwind = directionDeg + 180° (compass) → converted to SVG rotation.
 *
 * Compass → SVG rotation: both use clockwise-from-north / clockwise-from-up,
 * so SVG rotation = (directionDeg + 180) % 360.
 */
export default function WindArrow({ speedKnots, directionDeg, color = '#00B4D8', size = 110 }: Props) {
  const cx = size / 2;
  const cy = size / 2;

  // Arrow geometry (pointing UP in local space; rotated afterward)
  const shaftW  = size * 0.13;   // shaft width
  const headW   = size * 0.38;   // arrowhead width
  const headH   = size * 0.30;   // arrowhead height
  const total   = size * 0.78;   // total arrow length
  const shaftL  = total - headH; // shaft length

  // Arrow drawn pointing upward, centred on cx,cy
  const top    = cy - total / 2;
  const bottom = cy + total / 2;
  const headBase = top + headH;

  // Arrowhead triangle (tip at top)
  const arrowPath = [
    `M ${cx} ${top}`,                                      // tip
    `L ${cx + headW / 2} ${headBase}`,                     // right shoulder
    `L ${cx + shaftW / 2} ${headBase}`,                    // right shaft-top
    `L ${cx + shaftW / 2} ${bottom}`,                      // right shaft-bottom
    `L ${cx - shaftW / 2} ${bottom}`,                      // left shaft-bottom
    `L ${cx - shaftW / 2} ${headBase}`,                    // left shaft-top
    `L ${cx - headW / 2} ${headBase}`,                     // left shoulder
    `Z`,
  ].join(' ');

  // SVG rotation: tail→head points downwind
  const svgRotation = (directionDeg + 180) % 360;

  // Knots label — centred on the shaft, below the arrowhead
  const labelY = headBase + shaftL * 0.5;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={svgRotation} origin={`${cx}, ${cy}`}>
          {/* Arrow body */}
          <Path
            d={arrowPath}
            fill={color}
          />
          {/* Knots label on the shaft */}
          <SvgText
            x={cx}
            y={labelY + 5}          // +5 for vertical text baseline alignment
            textAnchor="middle"
            fontSize={shaftW * 1.1}
            fontWeight="900"
            fill="#fff"
            rotation={-svgRotation} // counter-rotate so text stays upright
            origin={`${cx}, ${labelY}`}
          >
            {speedKnots}
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}
