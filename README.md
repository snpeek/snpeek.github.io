# snpeek

Welcome to **snpeek**!
This project uses [Svelte](https://svelte.dev/) and [SvelteKit](https://kit.svelte.dev/) along with [TypeScript](https://www.typescriptlang.org/).

## 🚀 Quickstart for Users

### 1. Clone the Repository

Clone this repository to your local machine:

```
git clone https://github.com/snpeek/snpeek.github.io.git
cd snpeek
```

### 2. Install Dependencies

Ensure [Node.js](https://nodejs.org/) is installed, then run:

```
npm install
```

### 3. Start the Application

Launch the application on your local development server:

```
npm run dev
```

Open your browser and navigate to [http://localhost:5173](http://localhost:5173).
Or you can simply click on the link in the same terminal from where you invoke `npm run dev`.

## 💻 For Developers and Contributors

### Setting Up the Development Environment

#### 1. Fork the Repository

Start by forking this repository to your own GitHub account.

#### 2. Clone Your Fork

Clone it to your local machine:

```
git clone ${your_forked_repository_url}
cd snpeek
```

#### 3. Install Dependencies

Run the following command:

```
npm install
```

#### 4. Start the Dev Server

Launch the application on your local development server:

```
npm run dev
```

Open your browser and navigate to [http://localhost:5173](http://localhost:5173).
Or you can simply click on the link in the same terminal from where you invoke `npm run dev`.

### 🏗 Building the Project

Compile the production-ready code:

```
npm run build
```

Preview it:

```
npm run preview
```

### 🧪 Running Tests

Make sure all tests pass before pushing any changes:

```
npm run test
```

### 🤝 How to Contribute

1. **Create a Branch:** Create a new branch for your feature or fix.
2. **Make Your Changes:** Implement and commit your changes with a meaningful message.
3. **Push to GitHub:** Push the branch to your fork on GitHub.
4. **Open a Pull Request:** From your forked repo, create a new pull request to the original repository.

### 📜 Scripts Explanation

A quick overview of available scripts in the `package.json` file:

- `test`: Execute tests with vitest.
- `build`: Build the production version of the application.
- `dev`: Build the development version of the application.
- `gh-deploy-init` and `gh-deploy`: Commands for deploying to GitHub Pages.
- `generate-data`: Utilize mock data scripts for development/testing.

### Structure

This is the information you'd need to understand how this project works, and what files to change when you want to make changes.

#### Directory Structure
- `public` - [DEPRECATED] Part of the asset management of the original app
- `src`
  - `lib`
    - `components` - Where all the UI-specific things reside. These are part of how shadcn-svelte works. These can be modified directly, as shadcn's principle is for UI libraries to be changeable to suit the needs of the app.
    - `models` - Where all the Models reside. A Model encapsulates both data structure (fields) and behavior (methods). For example, alleles/genotypes have the Genotype model, which allows us not to think about the order of nucleotides. `CT` and `TC` are treated equally by the `Genotype.matches` method, and instantiation is equally convenient with the `Genotype.fromString` method.
  - `routes` - Sveltekit's way of declaring routes. See Sveltekit documentation
    - `meyer-powers` - The meyer-powers route
      - `+page.svelte` - What the visitor sees when they visit `/meyer-powers`. This is the file that calls everything else to let the user do useful things.
      - `gene-variant-data-table.svelte` - Should probably be moved to `src/lib/components/gene-variant-data-table.svelte` or something like that, especially if we want to use these tables for other things. But for now, not necessary since the only route is `/meyer-powers`.
    - `+layout.svelte` - A utility thing, for wrapping all svelte files consistently. Right now, wraps everything with the `app.css` file.
    - `layout.ts` - Configuration that makes static page generation possible. Don't mess with this unless you know what you're doing
    - `+page.svelte` - What the visitor sees when they visit `/`. This is basically the `index.html` from the user's point of view. These is what renders the `meyer-powers syndrome panel` button.
  - `app.css` - Base styles
  - `app.d.ts` - Types relating to Svelte
  - `app.html` - The html entrypoint for Svelte
  - `index.test.ts` - In Svelte, it is idiomatic to colocate tests with the corresponding code. This is a temporary file, meant to house tests that we're not sure where they should be placed yet. The contents of this should be moved to the appropriate locations once the project settles.
  - `global.ts` - [DEPRECATED] Part of bootstrapping the original app
  - `index.ts` - [DEPRECATED] Contains most if not all the functionality in the original app. Everything in here has been moved and adapted to the new framework.
- `static` - Files that are meant to be served as-is. This includes data files like `mps-data.json`, but also favicons and robots.txt.
  - `mps` - A directory to specifically house `mps-data.json`.
  - `favicon.png` - We should probably replace this with a logo once we have this.

Files and directories marked [DEPRECATED] are for deletion once the migration to the new structure settles.

#### Models
- GeneDataParser - If you want to change how parsing works, or add support for other data formats, this is what you should be looking at.
- GeneVariant - These represent the individual rows of gene data. These are the ones with `rsid` and `gene`, etc...
- Genotype - An abstraction over genotypes and alleles, so we don't have to worry about the ordering of the nucleotides, etc...
- MpsData - Simply a representation of the JSON structure. If we change the structure of `mps-data.json`, then this should also be updated.

## 📄 License

snpeek is open-sourced software licensed under the [MIT License](LICENSE).

## ✉️ Contact & Support

Feel free to [open an issue](https://github.com/snpeek/snpeek.github.io/issues) for support, questions, or suggestions. We welcome any feedback and contributions!
