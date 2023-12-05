import React, { useState } from 'react';
import './App.scss';
import MtgCardPanel from './mtg/MtgCardPanel';

type AppMode = 'short story' | 'mtg card';

const appModes: AppMode[] = ['mtg card', 'short story']

function appModeLabel(mode: AppMode): string {
  switch (mode) {
    case 'short story': return "short story";
    case 'mtg card': return "mtg card";
  }
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(appModes[0]);
  const [OPENAI_API_KEY, set_OPENAI_API_KEY] = useState<string>("");

  function renderMode(mode: AppMode): JSX.Element {
    if (OPENAI_API_KEY === "") {
      return <div style={{ fontStyle: 'italic' }}>
        You need to provide your OpenAI API key in order to use this app.
      </div>
    }
    switch (mode) {
      case 'short story': return (<div>short story</div>)
      case 'mtg card': return (<MtgCardPanel OPENAI_API_KEY={OPENAI_API_KEY} />)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className='App-title'>AI Webapps</div>
        <div className='App-api-key'>
          <input
            type='password'
            id="OPENAI_API_KEY"
            placeholder='OpenAI API key'
            onChange={(event) => set_OPENAI_API_KEY(event.target.value)}
          />
        </div>
        <div className='App-menu'>
          {appModes.map(currMode =>
            <div key={currMode} className={currMode === mode ? "active" : ""} onClick={() => setMode(currMode)}>
              {appModeLabel(currMode)}
            </div>
          )}
        </div>
      </header>
      <div className='App-content'>
        {renderMode(mode)}
      </div>
      <footer className='App-footer'>
        <div>share</div>
        <div>github</div>
        <div>email</div>
      </footer>
    </div>
  );
}
