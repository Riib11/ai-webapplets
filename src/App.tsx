import React, { useState } from 'react';
import './App.scss';
import MtgCardApplet from './mtg/MtgCardApplet';
import github from './github.png';

const appModes = [
  'mtg card',
  'short story',
  'knowledge graph',
  'example #1',
  'example #2',
  'example #3',
  'example #4',
  'example #5',
  'example #6',
  'example #7',
  'example #8',
  'example #9',
  'example #10',
  'example #11',
  'example #12',
  'example #13',
  'example #14',
  'example #15',
  'example #16',
  'example #17',
  'example #18',
  'example #19',
  'example #20',
  'example #21',
]

type AppMode = typeof appModes[number];

function appModeLabel(mode: AppMode): string {
  switch (mode) {
    default: return mode
  }
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(appModes[0]);
  const [OPENAI_API_KEY, set_OPENAI_API_KEY] = useState<string>("");

  function renderMode(mode: AppMode): JSX.Element {
    if (OPENAI_API_KEY === "") {
      return <div className='Panel' style={{ fontStyle: 'italic', backgroundColor: 'lightsalmon', padding: "1em" }}>
        You need to provide your OpenAI API key in order to use this app.
      </div>
    }
    switch (mode) {
      case 'mtg card': return (<MtgCardApplet OPENAI_API_KEY={OPENAI_API_KEY} />)
      default: return (<div>{mode}</div>)
    }
  }

  return (
    <div className="App">
      <div className='sidebar'>
        <div className='header'>
          <div className='title'>
            AI Webapplets
          </div>
          <input
            className='api-key'
            type='password'
            id="OPENAI_API_KEY"
            placeholder='OpenAI API key'
            onChange={(event) => set_OPENAI_API_KEY(event.target.value)}
          />
        </div>
        <div className='menu'>
          {appModes.map(currMode =>
            <div key={currMode} className={`item ${currMode === mode ? "active" : ""}`} onClick={() => setMode(currMode)}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "0.4em" }}>
                <div>•</div><div>{appModeLabel(currMode)}</div>
              </div>
            </div>
          )}
        </div>
        <div className='footer'>
          <div>𝕏</div>
          <div>gh</div>
        </div>
      </div>
      <div className='content'>
        {renderMode(mode)}
      </div>
    </div>
  );
}
