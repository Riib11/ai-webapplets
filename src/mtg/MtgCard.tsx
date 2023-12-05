import './MtgCard.scss'

export type MtgCard = {
  name: string,
  mana_cost: string,
  image_src?: string,
  card_type: MtgCardType,
  card_subtype?: string,
  oracle_text: string,
  flavor_text: string,
  status?: MtgCardStatus
}

export type MtgCardType
  = 'Creature'
  | 'Artifact'
  | 'Sorcery'
  | 'Instant'
  | 'Land'
  | 'Enchantment'
  | 'Planeswalker'

export type MtgCardStatus
  = { case: 'Creature', power: number, toughness: number, }
  | { case: 'Planeswalker', loyalty: number, }

type MtgBaseColor
  = 'red'
  | 'blue'
  | 'green'
  | 'white'
  | 'black'
  | 'colorless'

type MtgColor
  = { case: MtgBaseColor }
  | { case: 'gold' }
  | { case: 'hybrid', color1: MtgColor, color2: MtgColor }


function getColor(card: MtgCard): MtgColor {
  const colors_set: Set<MtgBaseColor> = new Set();
  for (let i = 0; i < card.mana_cost.length; i++) {
    const c = card.mana_cost.charAt(i).toLowerCase();
    switch (c) {
      case 'r': colors_set.add('red'); break;
      case 'u': colors_set.add('blue'); break;
      case 'g': colors_set.add('green'); break;
      case 'w': colors_set.add('white'); break;
      case 'b': colors_set.add('black'); break;
      default: break;
    }
  }
  const colors: MtgBaseColor[] = [...colors_set];
  for (let c in colors_set.values()) colors.push(c as MtgBaseColor);
  switch (colors.length) {
    case 0: return { case: 'colorless' }
    case 1: return { case: colors[0] }
    case 2: return { case: 'hybrid', color1: { case: colors[0] }, color2: { case: colors[1] } }
    default: return { case: 'gold' }
  }
}

function MtgColorToClassName(color: MtgColor): string {
  switch (color.case) {
    case 'red': return "MtgColor_red";
    case 'blue': return "MtgColor_blue";
    case 'green': return "MtgColor_green";
    case 'white': return "MtgColor_white";
    case 'black': return "MtgColor_black";
    case 'colorless': return "MtgColor_colorless";
    case 'gold': return "MtgColor_gold";
    case 'hybrid': return `MtgColor_hybrid_${color.color1.case}_${color.color2.case}`;
  }
}

export function MtgCardView({ card }: { card: MtgCard }): JSX.Element {
  return (
    <div className="MtgCard">
      <div className={["MtgCard_inner", MtgColorToClassName(getColor(card))].join(" ")}>
        <div className="MtgCard_header">
          <div className="MtgCard_name">{card.name}</div>
          <div className="MtgCard_mana_cost">{
            card.mana_cost
              // .replaceAll("0", "⓪")
              // .replaceAll("1", "①")
              // .replaceAll("2", "①")
              // .replaceAll("3", "③")
              // .replaceAll("4", "④")
              // .replaceAll("5", "⑤")
              // .replaceAll("6", "⑥")
              // .replaceAll("7", "⑦")
              // .replaceAll("8", "⑧")
              // .replaceAll("9", "⑨")
              .replaceAll("U", "💧")
              .replaceAll("R", "🔥")
              .replaceAll("G", "🌳")
              .replaceAll("B", "💀")
              .replaceAll("W", "🔆")
          }</div>
        </div>
        <div className="MtgCard_upper">
          <img className="MtgCard_image" src={card.image_src ?? 'https://www.nteeth.com/wp-content/uploads/2013/11/dummy-image-square1.jpg'}></img>
        </div>
        <div className="MtgCard_middle">
          <div>
            <div className="MtgCard_card_type">{card.card_type}</div>
            <div>––</div>
            <div className="MtgCard_card_subtype">{card.card_subtype}</div>
          </div>
          <div>
            <div className="MtgCard_card_expansion_symbol">🤖</div>
          </div>
        </div>
        <div className="MtgCard_lower">
          <div className="MtgCard_oracle_text">{card.oracle_text}</div>
          <hr className="MtgCard_lower_divider"></hr>
          <div className="MtgCard_flavor_text">{card.flavor_text}</div>
          {
            (() => {
              if (card.status === undefined) {
                return []
              } else {
                return [
                  <hr key={0} className="MtgCard_lower_divider"></hr>,
                  <div key={1} className="MtgCard_status">
                    {(() => {
                      switch (card.status.case) {
                        case 'Creature': return [
                          <div key={0} className="MtgCard_status_power">{card.status.power}</div>,
                          <div key={1} className="MtgCard_status_power_toughness_divider">/</div>,
                          <div key={2} className="MtgCard_status_toughness">{card.status.toughness}</div>
                        ]
                        case 'Planeswalker': return [
                          <div key={0} className="MtgCard_status_loyalty">{card.status.loyalty}</div>,
                        ]
                      }
                    })()}
                  </div>
                ]
              }
            })()
          }
        </div>
      </div>
    </div>
  )
}