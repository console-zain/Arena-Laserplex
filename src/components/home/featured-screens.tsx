import { HomeSectionReveal } from "@/components/home/home-scroll-motion";

interface FeaturedScreensProps {
  screens: readonly {
    code: "L" | "XL";
    name: string;
    capacity: number;
  }[];
}

export function FeaturedScreens({ screens }: FeaturedScreensProps) {
  return (
    <HomeSectionReveal>
      <section
        aria-labelledby="theatre-rooms-title"
        className="home-section home-section-theatre-rooms"
      >
        <div className="home-content">
          <div className="home-section-heading">
            <h2 id="theatre-rooms-title">Theatre Rooms</h2>
          </div>
          {screens.length > 0 ? (
            <ul className="home-theatre-grid">
              {screens.map((screen) => (
                <li className="home-theatre-card" key={screen.code}>
                  <span className="home-theatre-code">
                    Screen {screen.code}
                  </span>
                  <h3>{screen.name}</h3>
                  <p>
                    <strong>{screen.capacity.toLocaleString("en")}</strong>
                    {screen.capacity === 1 ? " seat" : " seats"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="home-empty">Screen specifications are unavailable.</p>
          )}
        </div>
      </section>
    </HomeSectionReveal>
  );
}
