import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

type SmokingIconProps = {
  size?: number;
  color?: string;
};

export default function SmokingIcon({ size = 24, color = '#000000' }: SmokingIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Cigarette body - horizontal rectangle */}
      <Rect
        x="4"
        y="10"
        width="10"
        height="4"
        rx="2"
        fill={color}
      />
      {/* Filter tip - darker section */}
      <Rect
        x="14"
        y="10"
        width="3"
        height="4"
        rx="1"
        fill={color}
        opacity="0.7"
      />
      {/* Smoke puffs */}
      <Path
        d="M2 8 Q3 7 4 8 Q5 9 4 10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <Path
        d="M2 10 Q3 9 4 10 Q5 11 4 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <Path
        d="M2 12 Q3 11 4 12 Q5 13 4 14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </Svg>
  );
}
