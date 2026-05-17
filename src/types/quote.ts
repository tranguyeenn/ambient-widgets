export type Quote = {
  text: string;
  author: string;
};

export const LOCAL_FALLBACK_QUOTE: Quote = {
  text: "nothing playing, so here’s a thought instead.",
  author: "quiet mode",
};
