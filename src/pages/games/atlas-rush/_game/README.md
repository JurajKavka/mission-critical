# Atlas Rush

Identify the countries of Africa or South America, or the 50 US states, against the clock. Configure the available levels and their seconds per country or state in `config.ts`. Each round’s total time is the selected level’s seconds per country or state multiplied by the number in the selected region. The game is served at `/games/atlas-rush/`, with a graphics catalog at `/games/atlas-rush/graphics/`. See the [website instructions](../../../../../README.md) for development and builds.

Country boundaries are derived from the public-domain [Natural Earth 1:110m dataset](https://www.naturalearthdata.com/) via [world.geo.json](https://github.com/johan/world.geo.json). Cabo Verde, Comoros, Mauritius, São Tomé and Príncipe, and Seychelles are shown as location markers because they are too small for that dataset. Country hover labels are available in development.

US state boundaries are derived from [PublicaMundi's GeoJSON dataset](https://github.com/PublicaMundi/MappingAPI/blob/master/data/geojson/us-states.json). Alaska and Hawaii are shown as inset maps.
