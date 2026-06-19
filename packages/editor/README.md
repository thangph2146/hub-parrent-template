# @thangph2146/lexical-editor

Một thư viện soạn thảo văn bản (Rich Text Editor) dựa trên [Lexical](https://lexical.dev/) dành cho React/Next.js.

## Tính năng chính

- **Rich Text Editing**: Hỗ trợ đầy đủ các định dạng văn bản (Bold, Italic, Underline, Code, v.v.)
- **Plugins Hệ thống**: Tích hợp sẵn nhiều plugin mạnh mẽ (Toolbar, Images, Tables, Layout, v.v.)
- **Dynamic Placeholder**: Hỗ trợ thay đổi placeholder linh hoạt thông qua prop.
- **Modern UI**: Giao diện hiện đại, dễ dàng tùy chỉnh qua CSS Variables.
- **TypeScript Support**: Được viết hoàn toàn bằng TypeScript với định nghĩa kiểu đầy đủ.

## Cài đặt

Sử dụng `npm`:

```bash
npm install @thangph2146/lexical-editor lexical @lexical/react
```

Sử dụng `pnpm`:

```bash
pnpm add @thangph2146/lexical-editor lexical @lexical/react
```

## Cách sử dụng

```tsx
import { LexicalEditor } from "@thangph2146/lexical-editor";
import "@thangph2146/lexical-editor/style.css";

function MyEditor() {
  const handleChange = (editorState) => {
    // Xử lý khi nội dung thay đổi
  };

  return (
    <LexicalEditor
      placeholder="Nhập nội dung tại đây..."
      onChange={handleChange}
    />gioi-thieu:team-section
  );
}
```

## List trong Lexical

List không lưu dạng HTML. Editor nhận và trả về `SerializedEditorState`
JSON, trong đó list là node `list` hoặc `listwithcolor` với `listType`:

- `bullet`: danh sách bullet.
- `number`: danh sách đánh số.
- `check`: task list.

Toolbar dùng `@lexical/list` command để chuyển block hiện tại:
`INSERT_UNORDERED_LIST_COMMAND`, `INSERT_ORDERED_LIST_COMMAND`,
`INSERT_CHECK_LIST_COMMAND`, và `REMOVE_LIST_COMMAND`. Không parse DOM thủ công.

Thụt lề list chỉ dùng `Tab` / `Shift+Tab`. Toolbar list chỉ đổi kiểu list
hoặc marker hiện tại (`-`, `+`, `a`, `A`, `i`, `I`, `1.1`); việc thụt lề hoặc
`Backspace` không tự đổi marker/icon theo cấp và theme không gắn class depth
để đổi kiểu hiển thị.

Khoảng cách list/text dùng chung nhịp ngang qua CSS variables:
`--editor-text-indent-width` và `--editor-tab-indent-width`. Mặc định text
không thụt (`0px`), list marker/tab dùng `1.5rem`.

## Giấy phép

MIT

## Publish

```bash
pnpm build
npm whoami
npm login
npm publish --access public
```
