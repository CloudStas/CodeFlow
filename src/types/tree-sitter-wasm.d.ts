declare module "tree-sitter" {
  namespace Parser {
    class Language {
      static load(path: string | URL): Promise<Language>;
    }
  }
}
