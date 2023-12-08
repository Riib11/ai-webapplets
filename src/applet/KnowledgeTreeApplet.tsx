import React, { useState } from 'react';
import Applet from '../Applet';
import * as ai from '../ai';
import Loader from '../widget/Loading';

export default function KnowledgeTreeApplet(
  props: {}
): React.ReactNode {
  const [title, set_title] = React.useState<string>("");

  return (
    <Applet title="Knowledge Tree">
      <div>
        <input
          type="text"
          value={title}
          placeholder='root topic title'
          onChange={(event) => set_title(event.target.value)}
          style={{
            width: "40em",
          }}
        />
      </div>
      <div
        style={{
          overflow: "scroll",
          padding: "1em",
        }}
      >
        <Node
          supertitles={[]}
          title={title}
        />
      </div>
    </Applet>
  )
}

type NodeKid = string | null;

function Node(
  props: {
    supertitles: string[],
    title: string,
  }
): React.ReactNode {
  const openai = ai.useOpenAI();
  const [subtitles, set_subtitles] = React.useState<NodeKid[]>([]);
  const [collapsed, set_collapsed] = React.useState<boolean>(false);

  async function gen_subtitles() {
    console.debug("gen_subtitles/start", props.supertitles, props.title, subtitles)

    set_collapsed(false);
    set_subtitles([
      null,
      null,
      null,
      null,
      null,
    ]);

    const gen = await ai.openai_chat_completions_create_function_call(
      openai,
      {
        'make_subtopic_titles': {
          type: "function",
          function: {
            name: "make_subtopic_titles",
            description: "Make subtopic titles for the main topic.",
            parameters: {
              type: "object",
              properties: {
                subtopic_title_1: { type: "string", description: "The first subtopic title." },
                subtopic_title_2: { type: "string", description: "The second subtopic title." },
                subtopic_title_3: { type: "string", description: "The third subtopic title." },
                subtopic_title_4: { type: "string", description: "The fourth subtopic title." },
                subtopic_title_5: { type: "string", description: "The fifth subtopic title." },
              },
              required: ["subtopic_title_1", "subtopic_title_2", "subtopic_title_3", "subtopic_title_4", "subtopic_title_5"],
            }
          }
        }
      },
      'make_subtopic_titles',
      [
        { role: "system", content: "You are a generalist research assistant that helps organize concepts using extremely concise labels." },
        { role: "user", content: `The main topic is "${props.title}"${props.supertitles.length === 0 ? `` : `, in the context of this heirarchy of supertopics above it: ${props.supertitles.map(title => `"${title}"`).join(" > ")}`}. Make subtopic titles for the main topic.` }
      ]
    ).then(result => result.expect())

    console.debug("gen", gen);

    set_subtitles([
      gen.subtopic_title_1,
      gen.subtopic_title_2,
      gen.subtopic_title_3,
      gen.subtopic_title_4,
      gen.subtopic_title_5,
    ]);

    console.debug("gen_subtitles/end", props.supertitles, props.title, [
      gen.subtopic_title_1,
      gen.subtopic_title_2,
      gen.subtopic_title_3,
      gen.subtopic_title_4,
      gen.subtopic_title_5,
    ])
  }

  return (
    <div
      className="node-container"
      style={{
        boxShadow: "0 0 1em 0 black",
        borderRadius: "1em",
        display: "flex",
        flexDirection: "column",
        width: "fit-content",
      }}
    >
      <div
        style={{
          padding: "1em",
          backgroundColor: "darkblue",
          color: "white",
          borderTopLeftRadius: "1em",
          borderTopRightRadius: subtitles.length === 0 ? "1em" : 0,
          borderBottomLeftRadius: subtitles.length === 0 ? "1em" : 0,
          borderBottomRightRadius: subtitles.length === 0 ? "1em" : 0,
          width: "fit-content",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "1em",
        }}
      >
        {props.title}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Button onClick={async () => await gen_subtitles()}>⨁</Button>
          <Button onClick={async () => set_collapsed(!collapsed)}>{collapsed ? "↓" : "↑"}</Button>
        </div>
      </div>
      <div
        style={{
          display: collapsed ? "none" : "flex",
          padding: subtitles.length === 0 ? 0 : "1em",
          transition: "all 1s linear",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "1em",
        }}
      >
        {subtitles.map((title, i) => {
          if (title === null) {
            return (
              <Loader key={i} />
            )
          } else {
            return (
              <Node key={i}
                supertitles={[...props.supertitles, props.title]}
                title={title}
              />
            )
          }
        })}
      </div>
    </div>
  )
}

function Button(props: React.PropsWithChildren<{
  onClick: React.MouseEventHandler<HTMLDivElement>,
  disabled?: boolean
}>): React.ReactNode {
  const [hover, setHover] = React.useState(false);

  return (
    <div
      style={{
        cursor: "pointer",
        width: "2em",
        height: "2em",
        background:
          props.disabled === true ? "red" :
            hover ? "purple" :
              "black",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={props.onClick}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      {props.children}
    </div>
  )
}