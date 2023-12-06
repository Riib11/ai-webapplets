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

  function renderGeneratingResult(inputs: Inputs, state: GenerationState): JSX.Element {
    return (<div>
      <div>Generating result for inputs: {JSON.stringify(inputs)}</div>
      <div>i: {state.i}</div>
    </div>)
  }

  function renderDoneResult(result: Result): JSX.Element {
    return (<div>
      Result: {JSON.stringify(result)}
    </div>)
  }

  return (
    <div>
      <ResultQueueApplet.ResultQueueApplet<Inputs, GenerationState, Result>
        defaultInputs={defaultInputs}
        initialGenerationState={initialGenerationState}
        generateResult={generateResult}
        renderGeneratingResult={renderGeneratingResult}
        renderDoneResult={renderDoneResult}
      />
    </div>
  )
}
