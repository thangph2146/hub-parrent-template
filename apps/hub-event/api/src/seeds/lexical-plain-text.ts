/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
type LexicalTextNode = {
  detail: number;
  format: number;
  mode: string;
  style: string;
  text: string;
  type: 'text';
  version: number;
};

type LexicalParagraphNode = {
  children: LexicalTextNode[];
  direction: null;
  format: string;
  indent: number;
  textFormat: number;
  textStyle: string;
  type: 'paragraph';
  version: number;
};

export type LexicalEditorState = {
  root: {
    children: LexicalParagraphNode[];
    direction: null;
    format: string;
    indent: number;
    type: 'root';
    version: number;
  };
};

function paragraph(text: string): LexicalParagraphNode {
  return {
    children: text
      ? [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            type: 'text',
            version: 1,
          },
        ]
      : [],
    direction: null,
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    type: 'paragraph',
    version: 1,
  };
}

export function lexicalFromPlainText(raw: string): LexicalEditorState {
  const lines = raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    root: {
      children:
        lines.length > 0
          ? lines.map((line) => paragraph(line))
          : [paragraph('')],
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}

export function isLexicalContentEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return true;
    try {
      return isLexicalContentEmpty(JSON.parse(trimmed));
    } catch {
      return false;
    }
  }
  if (typeof value !== 'object') return true;

  const root = (value as LexicalEditorState).root;
  if (!root?.children?.length) return true;

  return root.children.every((node) => {
    if (node?.type !== 'paragraph') return false;
    return !node.children?.length;
  });
}

export function isLexicalEditorState(
  value: unknown,
): value is LexicalEditorState {
  if (!value || typeof value !== 'object') return false;
  const root = (value as LexicalEditorState).root;
  return Boolean(root && root.type === 'root' && Array.isArray(root.children));
}
