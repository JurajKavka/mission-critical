# Neon Asteroids

Astro owns the route and metadata. The client-only React island renders the HUD, dialogs, and touch controls. The canvas simulation and renderer live in `runtime`; the controller publishes HUD snapshots and owns browser listeners, animation, and sound for its lifetime.
