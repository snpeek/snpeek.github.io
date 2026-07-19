<script lang="ts">
  import type { GeneVariant } from "$lib/models/GeneVariant";
  import GeneVariantDataTable from "./gene-variant-data-table.svelte";

  interface Section {
    phenotype: string;
    geneVariants: GeneVariant[];
  }

  // Mirrors +page.svelte: an unkeyed {#each} over reassignable state, so a
  // second "upload" reuses the existing table instance with a new prop.
  let sections: Section[] = $state([]);

  export function load(next: Section[]) {
    sections = next;
  }
</script>

{#each sections as section}
  <GeneVariantDataTable
    phenotype={section.phenotype}
    geneVariants={section.geneVariants}
  />
{/each}
