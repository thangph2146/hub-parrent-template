import {
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  QuoteIcon,
  TextIcon,
  ListMinusIcon,
  ListPlusIcon,
} from "lucide-react"

import {
  LIST_BLOCK_FORMAT_KEY,
  LIST_BLOCK_FORMAT_LABELS,
} from "../../../config/editor-list-config"
import {
  LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY,
  LEXICAL_NATIVE_LIST_BLOCK_FORMAT_LABELS,
} from "../../../config/editor-list-native-config"
import { IconSize } from "../../../ui/typography"

export const blockTypeToBlockName: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  paragraph: {
    label: "Paragraph",
    icon: (
      <IconSize size="sm">
        <TextIcon />
      </IconSize>
    ),
  },
  h1: {
    label: "Heading 1",
    icon: (
      <IconSize size="sm">
        <Heading1Icon />
      </IconSize>
    ),
  },
  h2: {
    label: "Heading 2",
    icon: (
      <IconSize size="sm">
        <Heading2Icon />
      </IconSize>
    ),
  },
  h3: {
    label: "Heading 3",
    icon: (
      <IconSize size="sm">
        <Heading3Icon />
      </IconSize>
    ),
  },
  [LIST_BLOCK_FORMAT_KEY.BULLET]: {
    label: LIST_BLOCK_FORMAT_LABELS[LIST_BLOCK_FORMAT_KEY.BULLET],
    icon: (
      <IconSize size="sm">
        <ListIcon />
      </IconSize>
    ),
  },
  [LIST_BLOCK_FORMAT_KEY.BULLET_DASH]: {
    label: LIST_BLOCK_FORMAT_LABELS[LIST_BLOCK_FORMAT_KEY.BULLET_DASH],
    icon: (
      <IconSize size="sm">
        <ListMinusIcon />
      </IconSize>
    ),
  },
  [LIST_BLOCK_FORMAT_KEY.BULLET_PLUS]: {
    label: LIST_BLOCK_FORMAT_LABELS[LIST_BLOCK_FORMAT_KEY.BULLET_PLUS],
    icon: (
      <IconSize size="sm">
        <ListPlusIcon />
      </IconSize>
    ),
  },
  [LIST_BLOCK_FORMAT_KEY.NUMBER]: {
    label: LIST_BLOCK_FORMAT_LABELS[LIST_BLOCK_FORMAT_KEY.NUMBER],
    icon: (
      <IconSize size="sm">
        <ListOrderedIcon />
      </IconSize>
    ),
  },
  [LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA]: {
    label: LIST_BLOCK_FORMAT_LABELS[LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA],
    icon: (
      <IconSize size="sm">
        <ListOrderedIcon />
      </IconSize>
    ),
  },
  [LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA_UPPER]: {
    label: LIST_BLOCK_FORMAT_LABELS[LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA_UPPER],
    icon: (
      <IconSize size="sm">
        <ListOrderedIcon />
      </IconSize>
    ),
  },
  [LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN]: {
    label: LIST_BLOCK_FORMAT_LABELS[LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN],
    icon: (
      <IconSize size="sm">
        <ListOrderedIcon />
      </IconSize>
    ),
  },
  [LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN_UPPER]: {
    label: LIST_BLOCK_FORMAT_LABELS[LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN_UPPER],
    icon: (
      <IconSize size="sm">
        <ListOrderedIcon />
      </IconSize>
    ),
  },
  [LIST_BLOCK_FORMAT_KEY.NUMBER_MULTI_LEVEL]: {
    label: LIST_BLOCK_FORMAT_LABELS[LIST_BLOCK_FORMAT_KEY.NUMBER_MULTI_LEVEL],
    icon: (
      <IconSize size="sm">
        <ListOrderedIcon />
      </IconSize>
    ),
  },
  [LIST_BLOCK_FORMAT_KEY.CHECK]: {
    label: LIST_BLOCK_FORMAT_LABELS[LIST_BLOCK_FORMAT_KEY.CHECK],
    icon: (
      <IconSize size="sm">
        <ListTodoIcon />
      </IconSize>
    ),
  },
  [LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.BULLET]: {
    label: LEXICAL_NATIVE_LIST_BLOCK_FORMAT_LABELS[
      LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.BULLET
    ],
    icon: (
      <IconSize size="sm">
        <ListIcon />
      </IconSize>
    ),
  },
  [LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.NUMBER]: {
    label: LEXICAL_NATIVE_LIST_BLOCK_FORMAT_LABELS[
      LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.NUMBER
    ],
    icon: (
      <IconSize size="sm">
        <ListOrderedIcon />
      </IconSize>
    ),
  },
  [LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.CHECK]: {
    label: LEXICAL_NATIVE_LIST_BLOCK_FORMAT_LABELS[
      LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.CHECK
    ],
    icon: (
      <IconSize size="sm">
        <ListTodoIcon />
      </IconSize>
    ),
  },
  code: {
    label: "Code Block",
    icon: (
      <IconSize size="sm">
        <CodeIcon />
      </IconSize>
    ),
  },
  quote: {
    label: "Quote",
    icon: (
      <IconSize size="sm">
        <QuoteIcon />
      </IconSize>
    ),
  },
}
