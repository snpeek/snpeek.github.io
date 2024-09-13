# ADR 001: Sveltekit Framework

## Context

At the time of writing, SNPeek uses bare javascript to manipulate the DOM to create and update the UI.

While this is fine during SNPeek's early stages, the project may benefit from a UI and state management framework/platform to abstract away DOM concerns, and allow contributors to make faster progress with the UI.

There are several frameworks that fulfill this function: React, Vue, and Svelte.

All of them are compatible with TypeScript, and so much of the internal logic of SNPeek should still work.

The author of this ADR favors Svelte because of a number of reasons that can be [explained better](https://stackoverflow.blog/2023/10/31/why-stack-overflow-is-embracing-svelte/) by other people.

Vercel also [purchased](https://vercel.com/blog/vercel-welcomes-rich-harris-creator-of-svelte) Svelte, likely securing its future because of funding, and hinting at not just its popularity, but also its potential.

## Decision

We will use Svelte moving forward.

## Status

Accepted

## Consequences

Adopting Sveltekit will add a bit of overhead in terms of build process, but it is well-documented, with a single canonical build toolchain so this overhead can be mitigated.

## Experience Report

To be written