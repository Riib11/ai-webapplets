import React from 'react';

export default function TextArea(
  props: {
    name: string,
    value: string,
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>,
    style?: React.CSSProperties,
  }
): React.ReactNode {
  const ref_textarea = React.useRef<HTMLTextAreaElement>(null);

  function updateHeight() {
    if (ref_textarea.current !== null) {
      ref_textarea.current.style.height = 0 + 'px';
      ref_textarea.current.style.height = ref_textarea.current.scrollHeight + 'px';
    }
  }

  React.useEffect(() => {
    updateHeight();
  })

  return (
    <textarea
      name={props.name}
      value={props.value}
      ref={ref_textarea}
      onChange={(event) => {
        updateHeight();
        props.onChange(event)
      }}
      style={props.style}
    />)
}