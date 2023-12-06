import React from 'react';
import *as constants from '../constants';

export default function LevelLoader(
  props: {
    maxLevel: number,
    level: number,
    width: React.CSSProperties['width']
  }
): React.ReactNode {
  return (
    <div
      style={{
        width: props.width,
        background: "black",
        padding: "0.2em",
      }}
    >
      <div
        style={{
          width: `calc((${props.level / props.maxLevel}) * ${props.width})`,
          height: "1em",
          background: constants.loader_background,
          transition: "width 500ms ease-in-out"
        }}
      >
      </div>

    </div>
  )
}