import '../Panel.scss'
import './MtgCardPanel.scss'
import { ChangeEventHandler, FormEventHandler, useMemo, useReducer, useState } from 'react'
import { MtgCard, MtgCardView } from './MtgCard';
import OpenAI from "openai";
import DescriptionLoading from '../widget/DescriptionLoading';

type Prompt = {
  system: string,
  theme: string,
  doImage: boolean,
}

type MtgCardFunctionCall =
  {
    name: "make_creature_card",
    arguments: {
      name: string,
      mana_cost: string,
      creature_type: string,
      oracle_text: string,
      power: number,
      toughness: number,
      flavor_text: string,
    }

  }

type MtgResult
  = { case: "awaiting", prompt: Prompt, card_id: number }
  | { case: "done", card: MtgCard }

var fresh_card_id = 0;

var results: MtgResult[] = [
  // {
  //   case: "done", card: {
  //     name: "Best Creature #1",
  //     mana_cost: "0",
  //     card_type: "Creature",
  //     card_subtype: "Winner",
  //     oracle_text: "Win the game.",
  //     flavor_text: "I win.",
  //     status: {
  //       case: 'Creature',
  //       power: 1,
  //       toughness: 1,
  //     }
  //   }
  // },
  // {
  //   case: "done", card: {
  //     name: "Best Creature #2",
  //     mana_cost: "0",
  //     card_type: "Creature",
  //     card_subtype: "Winner",
  //     oracle_text: "Win the game.",
  //     flavor_text: "I win.",
  //     status: {
  //       case: 'Creature',
  //       power: 1,
  //       toughness: 1,
  //     }
  //   }
  // }
];

function downloadMtgCard(card: MtgCard) {
  var jsonString = JSON.stringify(card);
  var blob = new Blob([jsonString], { type: "application/json" });
  var url = URL.createObjectURL(blob);

  var a = document.createElement('a');
  a.href = url;
  a.download = `${card.name}.mtg-card.json`;
  a.click();

  window.URL.revokeObjectURL(url);
}


export type MtgCardPanelProps = {
  OPENAI_API_KEY: string
}

export default function MtgCardPanel(props: MtgCardPanelProps): JSX.Element {
  const openai = useMemo(() => new OpenAI({
    apiKey: props.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  }), []);

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const [prompt, setPrompt] = useState<Prompt>({
    system: "You are expert designer for new Magic the Gathering cards. Your card designs are always interesting, unique, draw from many different sources of inspiration, balanced, and thematically aligned with the user's prompt. Your card designs always thoughtfully integrate user's theme with the mechanics of the card.",
    theme: "",
    doImage: true,
  });

  const [resultsCurrent, setResults] = useState(results);

  async function generateCreatureCard(prompt: Prompt): Promise<{ card_id: number, card: MtgCard } | string> {

    const card_id = fresh_card_id;
    fresh_card_id += 1;

    results = [{ case: "awaiting", card_id, prompt, }, ...results];
    setResults(results);

    const chat_completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: `Design a interesting and powerful yet balanced creature card with the following theme: ${prompt.theme}.` }
      ],
      model: "gpt-4-1106-preview",
      tool_choice:
        // force it to use `make_creature_card`
        { type: "function", function: { name: "make_creature_card" } },
      tools: [
        {
          type: "function"
          , function: {
            name: "make_creature_card",
            description: "Create a Magic the Gathering creature card",
            parameters: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The creature's name",
                },
                mana_cost: {
                  type: "string",
                  desription: "The creature card's mana cost.",
                },
                creature_type: {
                  type: "string",
                  description: "The creature's creature type.",
                },
                oracle_text: {
                  type: "string",
                  description: "The creature's oracle text.",
                },
                power: {
                  type: "number",
                  description: "The creature's power.",
                },
                toughness: {
                  type: "string",
                  description: "The creature's toughness.",
                },
                flavor_text: {
                  type: "string",
                  description: "The creature card's flavor text.",
                },
              },
            }
          }
        }
      ]
    });
    if (chat_completion.choices.length === 0) return "chat_completion: no choices"
    if (chat_completion.choices[0].message.tool_calls === undefined) return "chat_completion: undefined tool_calls"
    if (chat_completion.choices[0].message.tool_calls.length === 0) return "chat_completion: no tool_calls"

    let args: MtgCardFunctionCall['arguments'] = {} as any;
    try {
      args = JSON.parse(chat_completion.choices[0].message.tool_calls[0].function.arguments);
    } catch {
      return "invalid JSON";
    }

    args.oracle_text = args.oracle_text.replaceAll("\n", "\\n").replaceAll("\\n", "\n\n");
    args.flavor_text = args.flavor_text.replaceAll("\n", "\\n").replaceAll("\\n", "\n\n");


    const image_src = await (async () => {
      if (!prompt.doImage) return undefined;

      const image_prompt = [
        `You are an expert experienced expressive thoughtful fantasy artist. ${args.name} is a ${args.creature_type} creature, and here is a related thematic passage: ${args.flavor_text.replaceAll("\n", " ")}`,
        `Create a thematic artwork for ${args.name}. The artwork MUST be focussed on ${args.name} and capture the creature's essence and be fantasy styled, finely detailed, and high contrast.`,
      ].join("\n");

      const image_format = 'b64_json' as 'b64_json' | 'url';

      const image_completion = await openai.images.generate({
        model: 'dall-e-3',
        n: 1,
        size: '1024x1024',
        prompt: image_prompt,
        response_format: image_format
      })

      if (image_completion.data.length === 0) return "image_completion: no data";
      switch (image_format) {
        case 'b64_json': {
          if (image_completion.data[0].b64_json === undefined) return "image_completion: no b64_json";
          const b64_json = image_completion.data[0].b64_json as string
          console.debug(b64_json);
          return `data:image/png;base64,${b64_json}`
        }
        case 'url': {
          if (image_completion.data[0].url === undefined) return "image_completion: no url";
          return image_completion.data[0].url;
        }
      }
    })();

    return {
      card_id, card: {
        name: args.name,
        mana_cost: args.mana_cost,
        image_src,
        card_type: "Creature",
        card_subtype: args.creature_type,
        oracle_text: args.oracle_text,
        status: {
          case: 'Creature',
          power: args.power,
          toughness: args.toughness,
        },
        flavor_text: args.flavor_text
      }
    };
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value, type, checked } = event.target;
    setPrompt(prompt => ({
      ...prompt,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    console.log("submit prompt:", prompt);
    const result = await generateCreatureCard(prompt);
    if (typeof result === "string") {
      console.error(`error in generateCreatureCard: ${result}`);
      return
    }
    const { card, card_id } = result;
    console.log("generated card_id:", card_id);
    // replace "awaiting" entry with "done" entry of this card
    const i = results.findIndex(result => {
      // console.debug("checking result:", result.case, result.case === "awaiting" ? result.card_id : "<MtgCard>")
      // console.debug(result.case === "awaiting" && result.card_id === card_id)
      return result.case === "awaiting" && result.card_id === card_id
    });
    // console.debug("i", i)
    if (i === -1) {
      console.error("can't find card_id in awaiting results:", card_id);
      return
    }
    results.splice(i, 1, { case: "done", card });
    setResults(results)
    forceUpdate();
  }

  return (
    <div className="Panel MtgCardPanel">
      <div className='Panel-title'>
        MTG Card
      </div>

      <form className='Panel-form' onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <td><label>theme:</label></td>
              <td><input type="text" name="theme" value={prompt.theme} onChange={handleChange} /></td>
            </tr>
            <tr>
              <td><label>do image:</label></td>
              <td><input type="checkbox" name="doImage" checked={prompt.doImage} onChange={handleChange} /></td>
            </tr>
          </tbody>
        </table>
        <button type="submit">Submit</button>
      </form>

      <div className='Panel-result'>
        {resultsCurrent.map(result => {
          switch (result.case) {
            case 'awaiting': return (
              <DescriptionLoading key={result.card_id} description={result.prompt.theme} />
            );
            case 'done': return (
              <div style={({ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' })}>
                <MtgCardView key={result.card.name} card={result.card} />
                <button onClick={(event) => downloadMtgCard(result.card)}>download</button>
              </div>
            );
          }
        })}
      </div>
      <div>
        <button onClick={(event) => {
          resultsCurrent.forEach(result => { if (result.case === "done") downloadMtgCard(result.card) })
        }}>download all</button>
      </div>
    </div>
  )
}