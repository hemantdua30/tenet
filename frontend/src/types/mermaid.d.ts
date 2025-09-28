declare module 'mermaid' {
  export function initialize(config: any): void;
  export function init(config: any | undefined, nodes: string | NodeListOf<Element>): void;
  export function render(id: string, text: string): { svg: string };
  export function contentLoaded(): void;
  export function parse(text: string): any;
  export function parseDirective(directive: any, args: any, msg: any): void;

  export const mermaidAPI: {
    render: (id: string, text: string, callback: (svgCode: string, bindFunctions: any) => void) => void;
    parse: (text: string) => any;
  };
} 