import React from 'react';
import * as constants from '../constants'

export default function Button(props: React.PropsWithChildren<{
  onClick: React.MouseEventHandler<HTMLDivElement>,
  disabled?: boolean
}>): React.ReactNode {
  const [hover, setHover] = React.useState(false);

  return (
    <div
      style={{
        cursor: "pointer",
        width: "fit-content",
        padding: "0.5em",
        background:
          props.disabled === true ? constants.button_disabled_background :
            hover ? constants.button_hover_background :
              constants.button_background,
        color: constants.button_color
      }}

      onClick={props.onClick}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      {props.children}
    </div>
  )
}