import React, { useState } from 'react';
import MtgCardApplet from './mtg/MtgCardApplet';
import ExampleResultQueueApplet from './applet/ExampleResultQueueApplet';
import Applet from './Applet';
import * as constants from './constants';
import * as ai from './ai';
import KnowledgeTreeApplet from './applet/KnowledgeTreeApplet';
import BattleGeneratorApplet from './applet/BattleGeneratorApplet';

const appModes = (() => {
  let appModes = [
    'mtg card',
    'knowledge tree',
    'short story',
    'battle narrator',
  ];

  // for (let i = 1; i <= 40; i++) appModes.push(`example #${i}`);

  return appModes
})()

type AppMode = typeof appModes[number];

function renderAppModeContentLabel(mode: AppMode): string {
  switch (mode) {
    default: return mode
  }
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(appModes[0]);
  const [OPENAI_API_KEY, _set_OPENAI_API_KEY] = useState<string>("");

  function set_OPENAI_API_KEY(new_OPENAI_API_KEY: string): void {
    ai.keys.OPENAI_API_KEY = new_OPENAI_API_KEY;
    _set_OPENAI_API_KEY(new_OPENAI_API_KEY);
  }

  function renderAppModeContent(mode: AppMode): JSX.Element {
    return (
      <div
        style={{
          padding: "1em",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {(() => {
          if (OPENAI_API_KEY === "") {
            return (
              <div
                style={{
                  fontStyle: 'italic',
                  width: "fit-content",
                  backgroundColor: 'lightsalmon',
                  padding: "1em"
                }}>
                You need to provide your OpenAI API key in order to use this webapp.
              </div>
            )
          }
          switch (mode) {
            case 'mtg card': return (<MtgCardApplet />)
            case 'knowledge tree': return (<KnowledgeTreeApplet />)
            case 'example result queue': return (<ExampleResultQueueApplet />)
            case 'battle narrator': return (<BattleGeneratorApplet />)
            default: return (<Applet title={mode}>TODO</Applet>)
          }
        })()}
      </div>
    )
  }

  return (
    <div
      // main
      style={{
        height: "100svh",
        width: "100svw",
        display: "flex",
        flexDirection: "row",
        alignItems: "start",
        background: constants.sidebar_background,
        fontSize: constants.app_fontSize,
        fontFamily: constants.app_fontFamily
      }}>
      <div
        // sidebar
        style={{
          flexShrink: 0,
          width: constants.sidebar_width,
          height: "100svh",
          background: constants.sidebar_background,
          color: constants.sidebar_color,
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
        }}>
        <div style={{
          width: "100%",
          background: constants.sidebar_background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.2em",
        }}>
          <div style={{
            fontWeight: "bold",
            fontSize: "1.2em",
            fontFamily: "monospace"
          }}>
            ai-webapplets
          </div>
          <input
            type='password'
            id="OPENAI_API_KEY"
            placeholder='OpenAI API key'
            onChange={(event) => set_OPENAI_API_KEY(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              background: constants.sidebar_background,
              color: constants.sidebar_color,
              border: "none",
              outline: "none",
            }}
          />
        </div>
        <div
          style={{
            flexGrow: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            overflowY: "scroll",
          }}>
          {appModes.map(mode_ =>
            <MenuItem key={mode_}
              mode={mode_}
              activate={() => setMode(mode_)}
              active={mode_ === mode}
            />
          )}
        </div>
        <div
          // footer
          style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap", fontSize: "0.5em" }}
        >
          <FooterItem label="yb" href="https://rybl.net" />
          <FooterItem label="𝕏" href="https://x.com/rybl4" />
          <FooterItem label="gh" href="https://github.com/riib11" />
        </div>
      </div>
      <div
        // content
        style={{
          flexGrow: 1,
          height: "100svh",
          overflow: "scroll",
          background: constants.active_background
        }}>
        {renderAppModeContent(mode)}
      </div>
    </div >
  );
}

function MenuItem(props: { mode: AppMode, activate: () => void, active: boolean }): JSX.Element {
  const [hover, setHover] = React.useState(false);

  return (
    <div
      onClick={(event) => props.activate()}
      style={{
        padding: "0.5em",
        cursor: "pointer",
        backgroundColor:
          props.active ? constants.content_background :
            hover ? constants.hover_background :
              constants.sidebar_background,
        transition: "background 100ms linear"
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "0.4em"
        }}>
        <div>•</div>
        <div>{renderAppModeContentLabel(props.mode)}</div>
      </div>
    </div>
  )
}

function FooterItem(
  props: {
    label: string,
    href: string,
  }
): JSX.Element {
  const [hover, setHover] = React.useState(false);

  return (
    <a
      style={{
        display: "block",
        textAlign: "center",
        flexGrow: 1,
        padding: "0.5em 0",
        cursor: "pointer",
        color: constants.sidebar_color,
        textDecoration: "none",
        background: hover ? constants.hover_background : constants.sidebar_background,
      }}
      href={props.href}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >{props.label}</a>
  )
}