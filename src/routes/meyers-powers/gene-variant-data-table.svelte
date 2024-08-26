<script lang="ts">
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import * as Table from "$lib/components/ui/table";
  import type { GeneVariant } from "$lib/models/GeneVariant";
  import {
    BodyRow,
    createRender,
    createTable,
    DataBodyRow,
    Render,
    Subscribe,
  } from "svelte-headless-table";
  import { readable } from "svelte/store";

  export let geneVariants: GeneVariant[];

  const table = createTable(readable(geneVariants));

  const columns = table.createColumns([
    table.column({
      header: "Pathogenicity",
      accessor: (geneVariant) => {
        return geneVariant.pathogenic.find((genotype) =>
          geneVariant.genotype?.matches(genotype),
        );
      },
      cell: ({ value }) => {
        if (value != null) {
          return createRender(Badge, { variant: "destructive" }).slot(
            `PATHOGENIC: ${value}`,
          );
        } else {
          return createRender(Badge, { variant: "secondary" }).slot(
            "NOT PATHOGENIC",
          );
        }
      },
    }),
    table.column({
      accessor: "rsid",
      header: "RSID",
    }),
    table.column({
      accessor: "gene",
      header: "Gene",
    }),
    table.column({
      accessor: (geneVariant) => {
        const genotype = geneVariant.genotype;
        if (genotype == null) {
          return "--";
        }
        return genotype.toString();
      },
      header: "Genotype",
    }),
    table.column({
      accessor: (geneVariant) => {
        const pathogenicGenotypes = geneVariant.pathogenic;
        if (pathogenicGenotypes.length < 1) {
          return "--";
        }
        return pathogenicGenotypes
          .map((genotype) => genotype.toString())
          .join(", ");
      },
      header: "Pathogenic",
    }),
    table.column({
      accessor: "chromosome",
      header: "Chromosome",
    }),
    table.column({
      accessor: "position",
      header: "Position",
    }),
    // table.column({
    //   accessor: "phenotype",
    //   header: "Phenotype",
    // }),
  ]);
  const { headerRows, rows, tableAttrs, tableBodyAttrs } =
    table.createViewModel(columns);
</script>

<div class="rounded-md border">
  <Table.Root {...$tableAttrs}>
    <Table.Header>
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Head {...attrs}>
                  <Render of={cell.render()} />
                </Table.Head>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Header>
    <Table.Body {...$tableBodyAttrs}>
      {#each $rows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          <Table.Row {...rowAttrs}>
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell {...attrs}>
                  <Render of={cell.render()} />
                </Table.Cell>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
