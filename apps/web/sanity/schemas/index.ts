import type { SchemaTypeDefinition } from "sanity";
import { artistSchema } from "./artist";
import { artworkSchema } from "./artwork";
import { djSchema } from "./dj";
import { roomSchema } from "./room";
import { setSchema } from "./set";
import { storySchema } from "./story";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Core entities (order matters for references)
  artistSchema,
  djSchema,
  setSchema,
  artworkSchema,
  roomSchema,
  // Editorial
  storySchema,
];
