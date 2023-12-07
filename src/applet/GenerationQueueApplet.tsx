import React from 'react';
import * as constants from '../constants';
import Applet from '../Applet';

export type GenericInputValue
  = { case: 'long-string', value: string }
  | { case: 'short-string', value: string }
  | { case: 'number', min?: number, max?: number, value: number }
  | { case: 'boolean', value: boolean }

export type GenericInputs = { [key: string]: GenericInputValue }

export default function GenerationQueueApplet<Inputs extends GenericInputs, GenerationState, Generation>(
  props:
    {
      title: string,
      defaultInputs: Inputs,
      initializeGenerationState: (inputs: Inputs) => GenerationState,
      generate: (inputs: Inputs, state: GenerationState, setState: React.Dispatch<React.SetStateAction<GenerationState>>) => Promise<Generation>,
      renderGeneration: (inputs: Inputs, state: GenerationState, generation?: Generation) => JSX.Element,
      generationsStyle?: React.CSSProperties
    }
): JSX.Element {
  const [generationProps, setGenerationProps] = React.useState<GenerationProps<Inputs, GenerationState, Generation>[]>([]);
  const [inputs, setInputs] = React.useState<Inputs>(props.defaultInputs);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerationProps([...generationProps, {
      inputs: structuredClone(inputs),
      initializeGenerationState: props.initializeGenerationState,
      generate: props.generate,
      renderGeneration: props.renderGeneration,
    }])
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = event.target;
    const key = target.name;
    const value =
      target instanceof HTMLInputElement ? (target.type === 'checkbox' ? target.checked : target.value) :
        target instanceof HTMLTextAreaElement ? target.value :
          "impossible";
    setInputs({ ...inputs, [key]: { ...props.defaultInputs[key], value } });
  }

  function renderInput(key: string): JSX.Element {
    const value: GenericInputValue = inputs[key];
    const valueElement: JSX.Element = (() => {
      switch (value.case) {
        case 'short-string': return (
          <input
            type='text' name={key} value={value.value} onChange={handleChange}
          />
        )
        case 'long-string': return (
          <input
            name={key} value={value.value} onChange={handleChange}
            style={{
              minWidth: "40em",
              minHeight: "fit-content",
            }}
          />)
        case 'number': return (<input type='number' name={key} min={value.min} max={value.max} value={value.value} onChange={handleChange} />)
        case 'boolean': return (<input type='checkbox' name={key} checked={value.value} onChange={handleChange} />)
      }
    })();
    return (
      <tr key={key}>
        <td style={{
          verticalAlign: "top",
          textAlign: "right",
          fontWeight: "bold",
          maxWidth: "20em",
          overflowWrap: "break-word",
          paddingBottom: "1em",
          paddingRight: "1em",
        }}><div>{key}</div></td>
        <td style={{
          verticalAlign: "top",
        }}><div>{valueElement}</div>
        </td>
      </tr >
    )
  }

  return (
    <Applet title={props.title}>
      <form /** inputs */
        onSubmit={handleSubmit}
        style={{
          width: "fit-content",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          background: "darkgray",
        }}>
        <table>
          <tbody>
            {Object.keys(props.defaultInputs).map((key) => renderInput(key))}
          </tbody>
        </table>
        <SubmitButton />
      </form>
      <div /** generations */
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "flex-start",
          gap: "1em",
          overflow: "scroll",
          ...props.generationsStyle
        }}>
        {generationProps.map((props, i) => (
          <Generation
            key={i}
            inputs={props.inputs}
            initializeGenerationState={props.initializeGenerationState as any}
            generate={props.generate as any}
            renderGeneration={props.renderGeneration as any}
          />
        ))}
      </div>
    </Applet >
  )
}

function SubmitButton(props: {}) {
  const [hover, setHover] = React.useState(false);

  return (
    <button
      type="submit"
      style={{
        border: "none",
        cursor: "pointer",
        // width: "14em",
        width: "100%",
        height: "2em",
        fontWeight: "bold",
        color: constants.button_color,
        background: hover ? constants.button_hover_background : constants.button_background,
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >Submit</button>
  )
}

type GenerationProps<Inputs extends GenericInputs, GenerationState, Generation> = {
  inputs: Inputs,
  initializeGenerationState: (inputs: Inputs) => GenerationState,
  generate: (inputs: Inputs, state: GenerationState, setState: React.Dispatch<React.SetStateAction<GenerationState>>) => Promise<Generation>,
  renderGeneration: (inputs: Inputs, state: GenerationState, generation?: Generation) => JSX.Element,
}

function Generation<Inputs extends GenericInputs, GenerationState, Generation>(props: GenerationProps<Inputs, GenerationState, Generation>): JSX.Element {
  const [state, setState] = React.useState(props.initializeGenerationState(props.inputs));
  const [generation, setGeneration] = React.useState<Generation | undefined>(undefined);

  React.useEffect(() => {
    props.generate(props.inputs, state, setState).then(setGeneration);
  }, []);

  return props.renderGeneration(props.inputs, state, generation);
}
