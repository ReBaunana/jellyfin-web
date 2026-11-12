# Lock dependency graph validation

The quality workflow generates npm's complete lock-only CycloneDX graph,
including development, optional and peer dependencies. npm fails this step for
incompatible installed dependency edges; no partial graph is submitted to GitHub.

The explicit development pin `@noble/hashes` 1.8.0 satisfies the optional peer of
`@exodus/bytes` used by the jsdom test stack (`^1.8.0 || ^2.0.0`). npm retains
pkijs's exact 1.4.0 dependency in a separate nested location. This avoids forcing
a different hash implementation into pkijs or weakening the peer requirement.
It changes no runtime dependency declarations and needs no advisory exclusions.

This reference fork is not the deployed official Jellyfin container. Passing
graph validation or a clean source audit is not a production rollout claim.
