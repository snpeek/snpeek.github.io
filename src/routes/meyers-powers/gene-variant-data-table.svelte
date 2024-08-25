<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import type { GeneVariant } from "$lib/models/GeneVariant";
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import { readable } from "svelte/store";

  export let geneVariants: GeneVariant[];

  const table = createTable(readable(geneVariants));

  const columns = table.createColumns([
    table.column({
      accessor: "rsid",
      header: "RSID",
    }),
    table.column({
      accessor: "gene",
      header: "Gene",
    }),
    table.column({
      accessor: "genotype",
      header: "Genotype",
    }),
    table.column({
      accessor: "pathogenic",
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
  const { headerRows, pageRows, tableAttrs, tableBodyAttrs } =
    table.createViewModel(columns);
</script>

<div class="rounded-md border">
  <Table.Root {...$tableAttrs}>
    <Table.Header>
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
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
      {#each $pageRows as row (row.id)}
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
