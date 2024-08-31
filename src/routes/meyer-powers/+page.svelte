<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";
  import { Input } from "$lib/components/ui/input/index";
  import Progress from "$lib/components/ui/progress/progress.svelte";
  import { GeneDataParser } from "$lib/models/GeneDataParser";
  import type { GeneVariant } from "$lib/models/GeneVariant";
  import type { MpsData } from "$lib/models/MpsData";
  import { Info } from "lucide-svelte";
  import GeneVariantDataTable from "./gene-variant-data-table.svelte";
  let files: File[] = [];
  let parseProgress: number = 0;
  let geneVariantsByPhenotype: Map<string, GeneVariant[]>;

  function onFileInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    files = [...(target?.files ?? [])];
    analyze();
  }

  async function fetchMpsData(path: string): Promise<MpsData> {
    const response = await fetch(path); // TODO this should be passed in
    const mpsData: MpsData = await response.json();

    if (Object.keys(mpsData).length > 0) {
      return mpsData;
    } else {
      throw Error("Error: MPS data is empty");
    }
  }

  async function analyze() {
    const mpsData = await fetchMpsData("./mps/mps-data.json");
    if (files.length < 1) {
      // maybe an error message.
      console.log("No files selected");
      return;
    }
    const file = files[0] as File;
    const geneParser = await GeneDataParser.fromFile(file, mpsData);
    const geneVariants = await geneParser.parse((progress: number) => {
      parseProgress = progress;
    });
    geneVariantsByPhenotype = Map.groupBy(
      geneVariants,
      (geneVariant, index) => geneVariant.phenotype,
    );
  }
</script>

<main class="flex flex-col gap-8">
  <section class="container mx-auto">
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
  <section class="container mx-auto">
    <Input
      class="border-primary"
      id="gene-file"
      type="file"
      on:change={onFileInput}
    />
  </section>
  {#if files.length > 0 && parseProgress < 100}
    <section class="container mx-auto">
      <Progress value={parseProgress} />
    </section>
  {/if}
  <section class="container mx-auto">
    {#if geneVariantsByPhenotype != undefined}
      {#each geneVariantsByPhenotype as geneVariantEntry}
        <GeneVariantDataTable
          phenotype={geneVariantEntry[0]}
          geneVariants={geneVariantEntry[1]}
        />
      {/each}
    {/if}
  </section>
</main>
