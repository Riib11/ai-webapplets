import React from 'react';
import * as Applet from '../Applet';
import GenerationQueueApplet from '../applet/GenerationQueueApplet';
import { sleep } from 'openai/core';
import * as MtgCard from './MtgCard';
import * as ai from '../ai';
import OpenAI from 'openai';
import { Result, ok } from '../result';
import Button from '../widget/Button';
import LevelLoader from '../widget/LevelLoader';

type Inputs = {
  system: { case: 'long-string', value: string },
  theme: { case: 'short-string', value: string },
  "image?": { case: 'boolean', value: boolean },
}

type GenerationState = {
  level: number,
}

type Generation = { card: MtgCard.MtgCard }

export default function MtgCardApplet(
  props: {}
): React.ReactNode {
  const openai = ai.useOpenAI();

  const defaultInputs: Inputs = {
    system: { case: 'long-string', value: "You are expert designer for new Magic the Gathering cards. Your card designs are always interesting, unique, draw from many different sources of inspiration, balanced, and thematically aligned with the user's prompt. Your card designs always thoughtfully integrate user's theme with the mechanics of the card." },
    theme: { case: 'short-string', value: "" },
    "image?": { case: 'boolean', value: false },
  };

  function initializeGenerationState(inputs: Inputs): GenerationState {
    return ({
      level: 0,
    })
  };

  async function generate(inputs: Inputs, state: GenerationState, setState: React.Dispatch<React.SetStateAction<GenerationState>>): Promise<Result<Generation>> {
    function incrementLevel() {
      state = { ...state, level: state.level + 1 }
      setState(state)
    }

    incrementLevel()

    // text data
    const text_data = await ai.openai_chat_completions_create_function_call(openai,
      {
        createCreature: {
          type: "function",
          function: {
            name: "createCreature",
            description: "Create a Magic the Gathering creature card",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "The creature's name" },
                mana_cost: { type: "string", description: "The creature's mana cost.", },
                creature_type: { type: "string", description: "The creature's creature type.", },
                oracle_text: { type: "string", description: "The creature's oracle text.", },
                power: { type: "number", description: "The creature's power.", },
                toughness: { type: "number", description: "The creature's toughness.", },
                flavor_text: { type: "string", description: "The creature's flavor text.", },
              },
            }
          },
        }
      },
      "createCreature",
      [
        { role: "system", content: inputs.system.value },
        { role: "user", content: `Design a interesting and powerful yet balanced creature card with the following theme: ${inputs.theme.value}.` }
      ]
    ).then(result => result.expect());
    incrementLevel()

    // image data
    const image_src = await (async () => {
      if (!inputs["image?"].value) { return undefined }

      return await ai.openai_images_generate_b64_json(
        openai,
        [
          `You are an expert experienced expressive thoughtful fantasy artist. Consider the following thematic passage related to a ${text_data.creature_type} creature: ${text_data.flavor_text.replaceAll("\n", " ")}`,
          `Create a thematic artwork for the creature.`,
        ].join("\n")
      ).then(result => result.expect())
    })()
    incrementLevel()

    return ok<Generation>({
      card: {
        name: text_data.name,
        mana_cost: text_data.mana_cost,
        image_src,
        card_type: "Creature",
        card_subtype: text_data.creature_type,
        oracle_text: text_data.oracle_text,
        status: {
          case: 'Creature',
          power: text_data.power,
          toughness: text_data.toughness,
        },
        flavor_text: text_data.flavor_text
      }
    })
  }

  function renderGeneration(inputs: Inputs, state: GenerationState, set_state: React.Dispatch<React.SetStateAction<GenerationState>>, result?: Result<Generation>): JSX.Element {
    if (result === undefined) {
      return (
        <div>
          Theme: {inputs.theme.value}
          <LevelLoader maxLevel={inputs['image?'].value ? 3 : 2} level={state.level} width="10em" />
        </div>
      )
    } else {
      switch (result.case) {
        case 'err': return (
          <div>
            Error: {result.msg}
          </div>
        )
        case 'ok': {
          const card = result.value.card;
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1em",
              }}
            >
              <MtgCard.MtgCardView card={card} />
              <Button onClick={async (event) => downloadMtgCard(card)}
              >download</Button>
            </div>
          )
        }
      }
    }
  }

  return (
    <GenerationQueueApplet<Inputs, GenerationState, Result<Generation>>
      title="MTG Card Generator"
      defaultInputs={defaultInputs}
      initializeGenerationState={initializeGenerationState}
      generate={generate}
      renderGeneration={renderGeneration}
      generationsStyle={{
        flexDirection: "row-reverse",
      }}
    />
  )
}

function downloadMtgCard(card: MtgCard.MtgCard): void {
  var jsonString = JSON.stringify(card);
  var blob = new Blob([jsonString], { type: "application/json" });
  var url = URL.createObjectURL(blob);

  var a = document.createElement('a');
  a.href = url;
  a.download = `${card.name}.mtg-card.json`;
  a.click();

  window.URL.revokeObjectURL(url);
}