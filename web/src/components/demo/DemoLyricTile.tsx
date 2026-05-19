type LyricMode = "lyric" | "quote";

type DemoLyricTileProps = {
  mode: LyricMode;
};

const LYRIC = {
  song: "Holocene",
  artist: "Bon Iver",
  line: "Floors of a cabin creakin' under my step",
};

const QUOTE = {
  label: "Steve Jobs",
  mode: "quote mode",
  body: "The only way to do great work is to love what you do.",
};

export default function DemoLyricTile({ mode }: DemoLyricTileProps) {
  const isQuote = mode === "quote";

  return (
    <article
      className="demo-widget-glass demo-lyric"
      aria-label={isQuote ? "Quote preview" : "Lyrics preview"}
      data-mode={mode}
    >
      <header className="demo-widget-glass__chrome demo-lyric__chrome">
        <div className="demo-lyric__title">
          <h1 className="demo-lyric__song">
            {isQuote ? QUOTE.label : LYRIC.song}
          </h1>
          <span
            className={
              isQuote ? "demo-lyric__artist demo-lyric__mode-label" : "demo-lyric__artist"
            }
          >
            {isQuote ? QUOTE.mode : LYRIC.artist}
          </span>
        </div>
      </header>
      <div className="demo-lyric__body">
        <div className="demo-lyric__art-wrap">
          {isQuote ? (
            <span className="demo-lyric__icon" aria-hidden>
              &ldquo;
            </span>
          ) : (
            <div className="demo-lyric__art demo-lyric__art--placeholder" aria-hidden />
          )}
        </div>
        <p
          className={
            isQuote ? "demo-lyric__line demo-lyric__line--quote" : "demo-lyric__line"
          }
        >
          {isQuote ? QUOTE.body : `“${LYRIC.line}”`}
        </p>
      </div>
    </article>
  );
}
