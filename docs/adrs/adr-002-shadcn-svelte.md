# ADR 002: Shadcn-svelte UI Component Library

## Context
Building UI from scratch, unless there is a very specific vision, is generally not an efficient use of development effort, especially considering the statefulness of certain UI elements. Instead, using an established UI library can allow the developers to focus on business logic, rather than the minutiae of styles.

There are several popular UI libraries for Svelte, and they all have tradeoffs. The options will not be exhaustively listed here, but the most oft-mentioned are:
1. https://flowbite-svelte.com/
2. https://www.skeleton.dev/
3. https://www.shadcn-svelte.com/

Out of the three, Skeleton (ironically) seems to be the most fleshed-out, with the most bells and whistles, but also seems to require the most setup. It is also likely to take the most effort to make changes to.

Flowbite at first glance seemed fairly inoffensive, but upon viewing the documentation site, a new banner add would appear with every link clicked. Not a good sign.

Shadcn has an appealing operational doctrine: it's not an NPM package, but instead it's a CLI that adds components to the project, while adding sensible defaults and styling. This is a little cumbersome in that every new thing we need requries a CLI invocation, but it also means we have complete code ownership and change how the component works.

## Decision

We will use shadcn-svelte.

## Status

Accepted

## Consequences


## Experience Report

