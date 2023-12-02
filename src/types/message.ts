import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../trpc";

type RouterOutput  = inferRouterOutputs<AppRouter>

type Messages = RouterOutput['getFileMessages']['messages']
// it has text as string type

type OmitText = Omit<Messages[number], 'text'>
// we omit the text property from Messages so that we can modify it and add type of JSX element and string 
// because text in loading message is of type jsx element

type ExtendedText = {
    text: string|JSX.Element
}
// we create a new type where text is of type string or jsx

export type ExtendedMessage = OmitText & ExtendedText

// we export this which is a combination of both 