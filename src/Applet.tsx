import React from 'react';

export default function Applet(
  props: React.PropsWithChildren<{
    title: string,
  }>
): JSX.Element {
  return (
    <div 
      style={{
        display:"flex",
        flexDirection: "column",
        gap: "1em"
      }}
    >
      <Title>{props.title}</Title>
      {props.children}
    </div>
  )
}

function Title(props: React.PropsWithChildren<{}>) {
  return (
    <div
      style={{
        fontSize: "1.4em",
        fontWeight: "bold",
      }}>
      {props.children}
    </div>
  )
}
