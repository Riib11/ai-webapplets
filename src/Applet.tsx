import React from 'react';

export type Props = {
  OPENAI_API_KEY: string
}

export function AppletTitle(props: React.PropsWithChildren<{}>) {
  return (
    <div
      style={{
        fontSize: "1.4em",
        fontWeight: "bold",
        margin: "0 0 1em 0",
      }}>
      {props.children}
    </div>
  )
}