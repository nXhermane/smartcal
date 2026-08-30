/// <reference types="vitepress/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
