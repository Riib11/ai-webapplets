import OpenAI from 'openai';
import { Result, err, ok } from './result';
import React from 'react';

export const keys: {
  OPENAI_API_KEY?: string
} = {}

export function useOpenAI() {
  if (keys.OPENAI_API_KEY === undefined) throw new Error("OPENAI_API_KEY is undefined")
  return React.useMemo(() => new OpenAI({
    apiKey: keys.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  }), [keys.OPENAI_API_KEY])
}

export type ChatCompletionTools = {
  [name: string]: ChatCompletionTool
}

export type ChatCompletionTool = {
  type: "function",
  function: {
    name: string,
    description: string,
    parameters: ChatCompletionToolFunctionParameters,
  }
}

export type ChatCompletionToolFunctionParameters
  = { type: "object", properties: { [name: string]: ChatCompletionToolFunctionParameters } }
  | { type: "string", description: string }
  | { type: "number", description: string }
  | {}

export type FunctionCallParameters<T> =
  T extends { type: "function", function: { parameters: infer P } } ? FunctionCallParameters<P> :
  T extends { type: "object", properties: infer Properties } ? { [name in keyof Properties]: FunctionCallParameters<Properties[name]> } :
  T extends { type: "string" } ? string :
  T extends { type: "number" } ? number :
  never

export async function openai_chat_completions_create_function_call<Ts extends ChatCompletionTools, N extends keyof Ts>(
  openai: OpenAI,
  tools: Ts,
  name: N,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  model?: OpenAI.Chat.Completions.ChatCompletionCreateParams["model"],
): Promise<Result<FunctionCallParameters<Ts[N]>>> {
  const chat_completion = await openai.chat.completions.create({
    model: model ?? "gpt-4-1106-preview",
    tool_choice: { type: "function", function: { name: name as string } },
    tools: Object.keys(tools).map(name => tools[name]),
    messages,
  })

  if (chat_completion.choices.length === 0) return err("openai_chat_completions_create_function_call: no choices")
  if (chat_completion.choices[0].message.tool_calls === undefined) return err("openai_chat_completions_create_function_call: undefined tool_calls")
  if (chat_completion.choices[0].message.tool_calls.length === 0) return err("openai_chat_completions_create_function_call: no tool_calls")

  try {
    return ok(JSON.parse(chat_completion.choices[0].message.tool_calls[0].function.arguments));
  } catch {
    return err("openai_chat_completions_create_function_call: invalid JSON");
  }
}

export async function openai_images_generate_b64_json(
  openai: OpenAI,
  prompt: string,
): Promise<Result<string>> {
  const image_completion = await openai.images.generate({
    model: 'dall-e-3',
    n: 1,
    size: '1024x1024',
    prompt,
    response_format: 'b64_json'
  })

  if (image_completion.data.length === 0) return err("openai_images_generate_b64_json: no data");
  if (image_completion.data[0].b64_json === undefined) return err("openai_images_generate_b64_json: no b64_json");
  const b64_json = image_completion.data[0].b64_json as string
  return ok(`data:image/png;base64,${b64_json}`)
}