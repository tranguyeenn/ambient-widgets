export default function DemoWeatherWidget() {
  return (
    <article className="demo-weather" aria-label="Weather preview">
      <div className="demo-weather__glass">
        <header className="demo-weather__chrome">
          <h1 className="demo-weather__location">Lawrenceville</h1>
          <p className="demo-weather__updated">Updated 2:45 PM</p>
          <button type="button" className="demo-weather__locate">
            Use my location
          </button>
        </header>
        <div className="demo-weather__body">
          <p className="demo-weather__temp" aria-label="Current temperature">
            72°
          </p>
          <p className="demo-weather__condition">Partly cloudy</p>
          <p className="demo-weather__range">H 78° · L 61°</p>
        </div>
      </div>
    </article>
  );
}
