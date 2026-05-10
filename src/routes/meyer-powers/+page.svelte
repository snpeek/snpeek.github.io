<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";
  import { Input } from "$lib/components/ui/input/index";
  import Progress from "$lib/components/ui/progress/progress.svelte";
  import { GeneDataParser } from "$lib/models/GeneDataParser";
  import type { GeneVariant } from "$lib/models/GeneVariant";
  import type { MpsDataByRsid } from "$lib/models/MpsData";
  import { Info } from "lucide-svelte";
  import GeneVariantDataTable from "./gene-variant-data-table.svelte";

  interface IPhenotypeSection {
    phenotypeName: string;
    geneVariants: GeneVariant[];
  }
  let parseProgress: number | null = null;
  let phenotypeSections: IPhenotypeSection[];
  const phenotypePriority: string[] = [
    "Congenital Adrenal Hyperplasia",
    "Estrogen Production - Aromatase",
    "Estrogen Metabolism - 1A Dominant",
    "Estrogen Metabolism",
    "Estrogen Metabolism - 1B Dominant",
    "COMT Activity",
    "Estrogen Receptor Alpha",
  ];

  async function onFileInput(event: Event): Promise<void> {
    parseProgress = null;
    const target = event.target as HTMLInputElement;
    const files = [...(target?.files ?? [])];
    if (files.length < 1) {
      // TODO: Error message
      console.log("No files selected");
      return;
    }
    const file = files[0] as File;
    const panelDatabase = await fetchMpsData("/mps/mps-data.json");
    phenotypeSections = await analyze(
      file,
      panelDatabase,
      (progress: number) => {
        parseProgress = progress;
      },
    );
  }

  async function fetchMpsData(path: string): Promise<MpsDataByRsid> {
    const response = await fetch(path); // TODO this should be passed in
    const mpsData: MpsDataByRsid = await response.json();

    if (Object.keys(mpsData).length > 0) {
      return mpsData;
    } else {
      // TODO: Error message
      throw Error("Error: MPS data is empty");
    }
  }

  /**
   * Takes a {@link genomeFile} and compares it against a {@link panelDatabase} to produce
   * a list of {@link IPhenotypeSection}. {@link panelDatabase} is so called because
   * this same structure can be used for panels other than MPS.
   * Takes a {@link onParseProgress} callback to update UI as each chunk is processed.
   * @param genomeFile
   * @param panelDatabase
   * @param onParseProgress
   * @returns A promise for {@link IPhenotypeSection}
   */
  async function analyze(
    genomeFile: File,
    panelDatabase: MpsDataByRsid,
    onParseProgress: (progress: number) => void,
  ): Promise<IPhenotypeSection[]> {
    const geneParser = await GeneDataParser.fromFile(genomeFile, panelDatabase);
    const geneVariants = await geneParser.parse(onParseProgress);

    let geneVariantsByPhenotype: Map<string, GeneVariant[]> = Map.groupBy(
      geneVariants,
      (geneVariant, _) => geneVariant.phenotype,
    );
    let lowPriorityPhenotypes = Array.from(
      geneVariantsByPhenotype.keys(),
    ).filter((phenotype) => !phenotypePriority.includes(phenotype));

    return [...phenotypePriority, ...lowPriorityPhenotypes]
      .map((phenotype) => {
        return {
          phenotypeName: phenotype,
          geneVariants: geneVariantsByPhenotype.get(phenotype)!,
        };
      })
      .filter((phenotype) => phenotype.geneVariants != undefined);
  }
</script>

<main class="flex flex-col gap-8 mb-6">
  <section class="container px-4 md:px-8">
    <h1 class="text-4xl font-bold my-6">Meyer-Powers Syndrome</h1>
    <Alert.Root>
      <Info class="h-4 w-4" />
      <Alert.Title>Notice</Alert.Title>
      <Alert.Description>
        <ul class="list-disc">
          <li>
            All genetic data processing is performed entirely on your device, no
            data is sent or stored elsewhere.
          </li>
          <li>
            This software was written with best intentions, but I am not Dr.
            Powers nor am I a medical professional. There are no guarantees of
            correctness. Use at your discretion.
          </li>
          <li>
            Currently, 23andMe, Ancestry.com, and unzipped Nebula Genomics data
            is supported. To download your data:
          </li>
          <ul class="list-disc ml-4">
            <li>
              For 23andMe data, visit <a
                class="text-primary font-bold"
                href="https://you.23andme.com/tools/data/download/"
                target="_blank">23andMe</a
              >.
            </li>
            <li>
              For Ancestry.com data, visit <a
                class="text-primary font-bold"
                href="https://www.ancestry.com/account/data/user/download"
                target="_blank">Ancestry</a
              >.
            </li>
            <!-- <li>For Nebula Genomics data:</li>
          <ul>
            <li>Download the gz file from Nebula Genomics' website.</li>
            <li>Unzip the file using a tool like 7-Zip or WinRAR. If you're using a terminal, you can use the command
              "gzip -d yourfilename.vcf.gz".</li>
          </ul> -->
          </ul>
          <li>
            For more information, visit the <a
              class="text-primary font-bold"
              href="https://www.reddit.com/r/DrWillPowers/"
              >Dr Powers Subreddit</a
            >
          </li>
        </ul>
      </Alert.Description>
    </Alert.Root>
  </section>
  <section class="container px-4 md:px-8">
    <Input
      class="border-primary"
      id="gene-file"
      type="file"
      on:change={onFileInput}
    />
  </section>
  {#if parseProgress !== null && parseProgress < 100}
    <section class="container px-4 md:px-8">
      <Progress value={parseProgress} />
    </section>
  {/if}
  <section class="container px-4 md:px-8">
    {#if phenotypeSections != undefined}
      {#each phenotypeSections as phenotypeSection}
        <GeneVariantDataTable
          phenotype={phenotypeSection.phenotypeName}
          geneVariants={phenotypeSection.geneVariants}
        />
      {/each}
    {/if}
  </section>
</main>
