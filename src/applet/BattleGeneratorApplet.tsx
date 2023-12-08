import React from 'react';
import GenerationQueueApplet from './GenerationQueueApplet';
import * as ai from '../ai';
import OpenAI from 'openai';
import Loader from '../widget/Loading';

type Inputs = {
  "character 1 name": { case: 'short-string', value: string },
  "character 1 description": { case: 'long-string', value: string },
  "character 2 name": { case: 'short-string', value: string },
  "character 2 description": { case: 'long-string', value: string },
  "rounds": { case: 'number', value: number },
}

type Character = {
  name: string
  description: string
}

type GenerationState = {
  introduction?: string,
  introduction_written: boolean,
  rounds: Round[],
  rounds_written: number,
  conclusion?: string,
  winner?: string,
  conclusion_written: boolean,
}

type Round = {
  attacker_name: string,
  defender_name: string,
  description: string
}

type Generation = {
}

export default function BattleGeneratorApplet(
  props: {

  }
): React.ReactNode {
  const openai = ai.useOpenAI();

  const defaultInputs: Inputs = {
    "character 1 name": { case: 'short-string', value: "Steve Jobs" },
    "character 1 description": { case: 'long-string', value: "The visionary co-founder of Apple, revolutionized the personal computer and mobile phone industries with iconic products like the Macintosh, iPod, iPhone, and iPad." },
    "character 2 name": { case: 'short-string', value: "Bill Gates" },
    "character 2 description": { case: 'long-string', value: "A software pioneer and philanthropist, co-founded Microsoft, revolutionizing the personal computer industry and becoming one of the wealthiest people in the world. " },
    "rounds": { case: "number", value: 2 },
  }

  function initializeGenerationState(inputs: Inputs): GenerationState {
    return {
      rounds: [],
      introduction_written: false,
      rounds_written: 0,
      conclusion_written: false,
    }
  }

  async function generate(inputs: Inputs, state: GenerationState, set_state: React.Dispatch<React.SetStateAction<GenerationState>>): Promise<Generation> {
    const system: OpenAI.Chat.Completions.ChatCompletionMessageParam =
      { role: "system", content: `You are an expert storyteller and narrator for epic battle scenes. You are currently describing a battle between ${inputs['character 1 name'].value} and ${inputs['character 2 name'].value}.\n\nDescription of ${inputs['character 1 name'].value}: ${inputs['character 1 description'].value}\n\nDescription of ${inputs['character 2 description'].value}` }
    const transcript: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    async function generateRound() {
      const { attacker_name, defender_name } = await ai.openai_chat_completions_create_function_call(
        openai,
        {
          decide_attack: {
            type: "function",
            function: {
              name: "decide_attack",
              description: "Decide an attacker and defender character for the next attack.",
              parameters: {
                type: "object",
                properties: {
                  // enum: [inputs['character 1 name'], inputs['character 2 name']],
                  attacker_name: { type: "string", description: "The attacker's name." },
                  // enum: [inputs['character 1 name'], inputs['character 2 name']],
                  defender_name: { type: "string", description: "The defender's name." },
                }
              }
            }
          }
        },
        "decide_attack",
        [
          system,
          ...transcript,
          { role: "user", content: "Decide who should attack who next in the next part of this battle scene." },
        ]
      ).then(result => result.expect());

      transcript.push({ role: "user", content: `Write a single paragraph narrative description of the next part of the scene, where ${attacker_name} attacks ${defender_name}` });

      const { attack_narration } = await ai.openai_chat_completions_create_function_call(
        openai,
        {
          narrate_attack: {
            type: "function",
            function: {
              name: "narrate_attack",
              description: "",
              parameters: {
                type: "object",
                properties: {
                  attack_narration: {
                    type: 'string',
                    description: "A narrative description of the attack."
                  },
                }
              }
            }
          }
        },
        "narrate_attack",
        [
          system,
          ...transcript,
        ]
      ).then(result => result.expect())

      const attack: Round = {
        attacker_name,
        defender_name,
        description: attack_narration
      }

      set_state((state) => ({ ...state, rounds: [...state.rounds, attack] }))

      transcript.push({ role: "assistant", content: attack_narration });
    }

    async function generateIntroduction() {
      transcript.push({ role: "user", content: `Write a single paragraph narrative introduction to the battle scene between ${inputs['character 1 name'].value} and ${inputs['character 2 name'].value}. You MUST use intense dramatic cinematic exciting language.` });

      const { introduction_narration } = await ai.openai_chat_completions_create_function_call(
        openai,
        {
          narrate_battle_introduction: {
            type: "function",
            function: {
              name: "narrate_battle_introduction",
              description: "",
              parameters: {
                type: "object",
                properties: {
                  introduction_narration: {
                    type: 'string',
                    description: "A narrative introduction to a battle scene."
                  },
                }
              }
            }
          }
        },
        "narrate_battle_introduction",
        [
          system,
          ...transcript,
        ]
      ).then(result => result.expect())

      set_state((state) => ({ ...state, introduction: introduction_narration }))

      transcript.push({ role: "assistant", content: introduction_narration });
    }

    async function generateConclusion() {
      const { advantage_name } = await ai.openai_chat_completions_create_function_call(
        openai,
        {
          decide_advantage: {
            type: "function",
            function: {
              name: "decide_advantage",
              description: "Decide who currently has an advantage in the battle.",
              parameters: {
                type: "object",
                properties: {
                  advantage_name: { type: "string", description: "The name of the character who currently has an advantage in the battle." },
                }
              }
            }
          }
        },
        "decide_advantage",
        [
          system,
          ...transcript,
          { role: "user", content: "Decide who currently has an advantage in the battle." },
        ]
      ).then(result => result.expect());

      const { conclusion_narration } = await ai.openai_chat_completions_create_function_call(
        openai,
        {
          narrate_conclusion: {
            type: "function",
            function: {
              name: "narrate_conclusion",
              description: "",
              parameters: {
                type: "object",
                properties: {
                  conclusion_narration: {
                    type: 'string',
                    description: "A narrative description of the conclusion of the battle."
                  },
                }
              }
            }
          }
        },
        "narrate_conclusion",
        [
          system,
          ...transcript,
          { role: "user", content: `Write a single paragraph narrative conclusion to the battle scene, where ${advantage_name} wins.` }
        ]
      ).then(result => result.expect())

      set_state((state) => ({ ...state, conclusion: conclusion_narration, winner: advantage_name, }))

      transcript.push({ role: "assistant", content: conclusion_narration });
    }

    await generateIntroduction();
    for (let attack_i = 0; attack_i < 2; attack_i++) await generateRound();
    await generateConclusion();

    return {}
  }

  function renderGeneration(inputs: Inputs, state: GenerationState, set_state: React.Dispatch<React.SetStateAction<GenerationState>>, generation?: Generation | undefined): JSX.Element {
    function renderContainer(key: number | string, kid: JSX.Element, visible: boolean): JSX.Element {
      return (
        <div key={key}>
          {visible ? kid : []}
        </div>
      )
    }

    function renderLoader(): JSX.Element {
      return renderContainer(
        "loader",
        (<Loader />),
        true
      )
    }

    function renderIntroduction(): JSX.Element {
      return renderContainer(
        "introduction",
        state.introduction === undefined ? renderLoader() :
          (<div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1em"
            }}
          >
            {/* <div>[introduction]</div> */}
            <Typewriter content={state.introduction} onComplete={() => set_state(state => ({ ...state, introduction_written: true }))} />
          </div>),
        true
      );
    }

    function renderEvent(i: number, round: Round): JSX.Element {
      return renderContainer(
        i,
        (<div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1em"
          }}
        >
          {/* <div>[round]</div> */}
          <Typewriter content={round.description} onComplete={() => set_state(state => ({ ...state, rounds_written: state.rounds_written + 1 }))} />
        </div>),
        (i === 0 && state.introduction_written) || (state.rounds.length > i && state.rounds_written > i - 1)
      )
    }

    function renderConclusion(): JSX.Element {
      return renderContainer(
        "conclusion",
        state.conclusion === undefined ? renderLoader() :
          (<div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1em"
            }}
          >
            {/* <div>[conclusion]</div> */}
            <Typewriter content={state.conclusion} onComplete={() => set_state(state => ({ ...state, conclusion_written: true }))} />
            {state.conclusion_written ? <FadeIn style={{ fontSize: "2em" }}><i>winner:</i> <b>{state.winner}</b></FadeIn> : []}
          </div>),
        state.conclusion !== undefined && state.rounds_written === inputs.rounds.value
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "1em",
          width: "40em",
          padding: "1em",
          background: "darkgray",
        }}
      >
        {renderIntroduction()}
        {state.rounds.map((round, i) => renderEvent(i, round))}
        {renderConclusion()}
      </div>
    )
  }

  return (
    <GenerationQueueApplet<Inputs, GenerationState, Generation>
      title="Battle Generator"
      defaultInputs={defaultInputs}
      initializeGenerationState={initializeGenerationState}
      generate={generate}
      renderGeneration={renderGeneration}
    />
  )
}

function Typewriter(
  props: {
    delay_ms?: number,
    content: string,
    style?: React.CSSProperties,
    onComplete?: () => void,
  }
): React.ReactNode {
  const delay = props.delay_ms ?? 1;
  const [i, set_i] = React.useState<number>(0);
  const [completed, set_completed] = React.useState(false);

  React.useEffect(() => {
    let timestamp = performance.now();
    let requestId: number | null = null;
    const update = () => {
      const now = performance.now();
      if (timestamp + delay < now) {
        timestamp = now;
        const di = Math.floor(Math.random() * 2) + 1;
        set_i(i => i + di);
      }
      requestId = requestAnimationFrame(update);
    };

    update();

    return () => { if (requestId !== null) { return cancelAnimationFrame(requestId) } };
  }, []);


  React.useEffect(() => {
    if (!completed && !(i < props.content.length) && props.onComplete !== undefined) {
      set_completed(true);
      props.onComplete();
    }
  }, [i]);

  return (
    <div style={props.style}>{props.content.slice(0, i)}</div>
  )
}

function FadeIn(
  props: React.PropsWithChildren<{
    duration_ms?: number,
    style?: React.CSSProperties,
  }>
): React.ReactNode {
  const [opacity, set_opacity] = React.useState<number>(0);

  React.useEffect(() => {
    let requestId: number | null = null;
    let timestamp = performance.now();
    const update = () => {
      const now: number = performance.now();
      set_opacity(Math.min(1, (now - timestamp) / (props.duration_ms ?? 1000)));
      requestId = requestAnimationFrame(update);
    };

    update();
    return () => { if (requestId !== null) { return cancelAnimationFrame(requestId) } };
  }, []);

  return (
    <div
      style={{
        opacity: opacity,
        // transition: `opacity ${props.duration_ms}ms linear`,
        ...props.style
      }}
    >
      {props.children}
    </div>
  )

}