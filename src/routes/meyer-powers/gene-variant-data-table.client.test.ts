import { GeneVariant } from "$lib/models/GeneVariant";
import { Genotype } from "$lib/models/Genotype";
import { flushSync, mount } from "svelte";
import { expect, test } from "vitest";
import Harness from "./gene-variant-data-table.harness.svelte";

type App = {
  load: (s: { phenotype: string; geneVariants: GeneVariant[] }[]) => void;
};

function mountHarness(): { target: HTMLElement; app: App } {
  const target = document.createElement("div");
  document.body.appendChild(target);
  return { target, app: mount(Harness, { target }) as unknown as App };
}

function variant(gene: string): GeneVariant {
  return new GeneVariant({
    rsid: "rs1",
    genotype: null,
    phenotype: "COMT Activity",
    pathogenic: [],
    gene,
  });
}

// Regression test for the row-model reactivity bug: the table body was rendered
// from a hoisted `const rows = table.getRowModel().rows`, which never recomputed
// when the `geneVariants` prop changed. Uploading a second file reuses the table
// instance (unkeyed {#each}) and would leave the body showing the first file's data.
test("table body reflects a reassigned geneVariants prop (second file upload)", () => {
  const { target, app } = mountHarness();

  // First upload: fresh table instance.
  app.load([{ phenotype: "COMT Activity", geneVariants: [variant("GENE_FIRST")] }]);
  flushSync();
  expect(target.textContent).toContain("GENE_FIRST");

  // Second upload: same section count, so the {#each} reuses the instance and
  // only updates its `geneVariants` prop.
  app.load([{ phenotype: "COMT Activity", geneVariants: [variant("GENE_SECOND")] }]);
  flushSync();

  expect(target.textContent).toContain("GENE_SECOND");
  expect(target.textContent).not.toContain("GENE_FIRST");
});

// The Genotype column has to render the same strand orientation as the
// Attention and Interesting columns, otherwise a flagged row shows a
// pathogenic allele that does not appear in the genotype beside it.
test("Genotype column matches the flagged allele for a reverse-strand variant", () => {
  const { target, app } = mountHarness();

  // Forward-strand read of the pathogenic CT genotype of rs1801133, which
  // mps-data.json reports on the reverse strand.
  const reverseStrandVariant = new GeneVariant({
    rsid: "rs1801133",
    genotype: Genotype.fromString("AG"),
    phenotype: "Methylation",
    pathogenic: [Genotype.fromString("CT")!],
    gene: "MTHFR",
    flipStrand: true,
  });

  app.load([{ phenotype: "Methylation", geneVariants: [reverseStrandVariant] }]);
  flushSync();

  expect(target.textContent).toContain("ATTN:CT");
  expect(target.textContent).toContain("CT");
  expect(target.textContent).not.toContain("AG");
});
