<script lang="ts">
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Table from "$lib/components/ui/table";
  import type { GeneVariant } from "$lib/models/GeneVariant";
  import { ExternalLink } from "@lucide/svelte";
  import { type ColumnDef, getCoreRowModel } from "@tanstack/table-core";
  import {
    createSvelteTable,
    FlexRender,
    renderComponent,
    renderSnippet,
  } from "$lib/components/ui/data-table";
  import { createRawSnippet, type Snippet } from "svelte";

  interface Props {
    phenotype: string;
    geneVariants: GeneVariant[];
  }

  let { phenotype, geneVariants }: Props = $props();

  let pathogenicAlleles = $derived(
    geneVariants.filter((geneVariant) => {
      return geneVariant.pathogenicAllele != null;
    }),
  );

  const columns: ColumnDef<GeneVariant>[] = [
    {
      header: "Attention",
      accessorFn: (geneVariant, _) => geneVariant.pathogenicAllele,
      cell: (cellContext) => {
        const value = cellContext.getValue();
        if (value != null) {
          return renderComponent(Badge, {
            variant: "destructive",
            children: createRawSnippet(() => ({
              render: () => `<span>ATTN:${value}</span>`,
            })),
          });
        } else {
          return renderComponent(Badge, {
            variant: "secondary",
            children: createRawSnippet(() => ({
              render: () => "<span>NO ATTN</span>",
            })),
          });
        }
      },
    },
    {
      header: "Gene",
      accessorFn: (geneVariant, _) => geneVariant.gene,
      cell: (cellContext) => {
        const value = cellContext.getValue();
        if (value == null) return "";
        return renderSnippet(linkButton, {
          text: value as string,
          url: `https://www.ncbi.nlm.nih.gov/gene/?term=${value}`,
        });
      },
    },
    {
      header: "RSID",
      accessorFn: (geneVariant, _) => geneVariant.rsid,
      cell: (cellContext) => {
        const value = cellContext.getValue();
        if (value == null) return "";
        return renderSnippet(linkButton, {
          text: value as string,
          url: `https://www.snpedia.com/index.php/${value}`,
        });
      },
    },
    {
      header: "Genotype",
      accessorFn: (geneVariant, _) => {
        const genotype = geneVariant.genotype;
        if (genotype == null) {
          return "--";
        }
        return genotype.toString();
      },
    },
    {
      header: "Interesting",
      accessorFn: (geneVariant, _) => {
        const pathogenicGenotypes = geneVariant.pathogenic;
        if (pathogenicGenotypes.length < 1) {
          return "--";
        }
        return pathogenicGenotypes
          .map((genotype) => genotype.toString())
          .join(", ");
      },
    },
  ];
  // const { headerRows, rows, tableAttrs, tableBodyAttrs } =
  //   table.createViewModel(columns);

  const table = createSvelteTable({
    get data() {
      return geneVariants;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = $derived(table.getRowModel().rows);
</script>

{#snippet linkButton(params: { text: string; url: string })}
  <Button
    target="_blank"
    variant="secondary"
    class="px-2 md:px-4"
    href={params.url}
  >
    {params.text}
    <ExternalLink class="h-4 w-4 ms-1" />
  </Button>
{/snippet}

<h2 class="text-3xl font-semibold my-4">
  {phenotype}
  <Badge variant={pathogenicAlleles.length > 0 ? "destructive" : "outline"}>
    {pathogenicAlleles.length} / {geneVariants.length}
  </Badge>
</h2>
<div class="rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head style={`width: ${100 / headerGroup.headers.length}%`}>
              <FlexRender
                content={header.column.columnDef.header}
                context={header.getContext()}
              />
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each rows as row (row.id)}
        <Table.Row>
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
