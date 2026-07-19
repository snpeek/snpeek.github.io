import { GeneVariant } from "$lib/models/GeneVariant";
import { flushSync, mount } from "svelte";
import { expect, test } from "vitest";
import Harness from "./gene-variant-data-table.harness.svelte";

function variant(gene: string): GeneVariant {
  return new GeneVariant({
    rsid: "rs1",
    chromosome: "1",
    position: "1",
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
  const target = document.createElement("div");
  document.body.appendChild(target);

  const app = mount(Harness, { target }) as unknown as {
    load: (s: { phenotype: string; geneVariants: GeneVariant[] }[]) => void;
  };

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
