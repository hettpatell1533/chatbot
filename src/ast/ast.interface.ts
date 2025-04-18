export interface AstMetadata {
  file: string;
  imports: string[];
  exports: string[];
  functions: string[];
  classes: string[];
  state: string[];
  events: string[];
  render: string[];
  apis: string[];
  variables?: Record<string, string>;
}
