import React from 'react';
import * as Applet from '../Applet';
import * as ResultQueueApplet from './ResultQueueApplet';
import { sleep } from 'openai/core';

type Inputs = {
  "some text input goes here you know": { case: 'string', value: string }
  "this is actually a boolean value": { case: 'boolean', value: boolean }
  "this is a number, and you should enter it properly!! but if you don't its not a huge deal but actually it is": { case: 'number', value: number }
}

type GenerationState = {
  i: number
}

type Result = {
  output1: string
}

export default function ExampleResultQueueApplet(props: {}): JSX.Element {
  const defaultInputs: Inputs = {
    "some text input goes here you know": { case: 'string', value: "" },
    "this is actually a boolean value": { case: 'boolean', value: false },
    "this is a number, and you should enter it properly!! but if you don't its not a huge deal but actually it is": { case: 'number', value: 0 },
  }

  function initialGenerationState(inputs: Inputs): GenerationState {
    return ({
      i: 0
    })
  }

  async function generateResult(inputs: Inputs, state: GenerationState, setState: React.Dispatch<React.SetStateAction<GenerationState>>): Promise<Result> {
    for (let i = 0; i < 10; i++) {
      setState({ ...state, i });
      await sleep(100);
    }
    return {
      output1: "Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! Hello, world! "
    }
  }

  function renderResult(inputs: Inputs, state: GenerationState, result?: Result): JSX.Element {
    const style: React.CSSProperties =
    {
      transition: "border-color 1s linear",
      padding: "0.5em",
      borderStyle: "solid",
      borderWidth: "0.5em",
      ...
      (result === undefined ?
        {
          backgroundColor: "goldenrod",
          borderColor: "transparent",
        } :
        {
          backgroundColor: "lightsteelblue",
          borderColor: "black",
        }
      )
    }

    if (result === undefined) {
      return (
        <div style={style}>
          <div>Generating result for inputs: {JSON.stringify(inputs)}</div>
          <div>i: {state.i}</div>
        </div>
      )
    } else {
      return (
        <div style={style}>
          Result: {JSON.stringify(result)}
        </div>
      )
    }
  }

  return (
    <ResultQueueApplet.ResultQueueApplet<Inputs, GenerationState, Result>
      title="Example Result Queue"
      defaultInputs={defaultInputs}
      initialGenerationState={initialGenerationState}
      generateResult={generateResult}
      renderResult={renderResult}
    />
  )
}
