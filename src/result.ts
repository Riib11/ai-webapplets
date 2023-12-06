export type Result<A>
  = (
    { readonly case: 'err', readonly msg: string } |
    { readonly case: 'ok', readonly value: A }
  ) &
  {
    expect: () => A,
    default: (value: A) => A
  }

export function err<A>(msg: string): Result<A> {
  return {
    case: 'err',
    msg,
    expect: () => { throw new Error(`expected ok, got err: ${msg}`) },
    default: (value) => value
  }
}

export function ok<A>(value: A): Result<A> {
  return {
    case: 'ok',
    value,
    expect: () => value,
    default: () => value
  }
}
