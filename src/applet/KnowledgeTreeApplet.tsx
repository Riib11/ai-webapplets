import React, { useState } from 'react';
import Applet from '../Applet';
import Button from '../widget/Button';
import * as ai from '../ai';

export default function KnowledgeTreeApplet(
  props: {}
): React.ReactNode {

  return (
    <Applet title="Knowledge Tree">
      <Node label="computer programming" />
    </Applet>
  )
}

function Node(
  props: {
    label: string
  }
): React.ReactNode {
  const openai = ai.useOpenAI();
  const [label, setLabel] = React.useState<string>(props.label);
  const [kidLabels, setKidLabels] = React.useState<string[]>([]);

  return (
    <div
      style={{
        border: "4px solid black",
        padding: "1em",
      }}
    >
      <div>{label}</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "1em",
        }}
      >
        {kidLabels.map((kid) => (
          <div key={kid}>
            <button
              onClick={(event) => {
                setKidLabels(kidLabels.filter(kidLabel => kidLabel !== kid))
              }}
            >
              remove</button>
            <Node label={kid} />
          </div>
        ))}
        <div>
          <button
            onClick={async (event) => {
              const gen = await ai.openai_chat_completions_create_function_call(
                openai,
                {
                  'create_subtopic': {
                    type: "function",
                    function: {
                      name: "create_subtopic",
                      description: "Create a subtopic of the current topic.",
                      parameters: {
                        type: "object",
                        properties: {
                          label: { type: "string", description: "A brief label for the subtopic." }
                        }
                      }
                    }
                  }
                },
                'create_subtopic',
                [
                  { role: "system", content: "You are a polymath research assistant that helps organize concepts using extremely concise labels." },
                  { role: "user", content: `The current topic is ${label}. So far I've found these subtopics: ${kidLabels.join(", ")}. What's another subtopic I should add?` }
                ]
              ).then(result => result.expect())

              setKidLabels([...kidLabels, gen.label]);
            }}
          >add</button>
        </div>
      </div>
    </div>
  )
}