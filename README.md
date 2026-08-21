# Plasma Calculators

Plasma Calculators is a collection of interactive, browser-based tools for plasma physics, laser systems, diagnostics, and accelerator experiments. The goal is to make commonly used estimates and conversions easy to run, inspect, and understand without requiring a separate desktop application.

The calculators provide physics-based estimates, reference values, and explanatory equations. They are intended to support experiment planning, quick checks, and learning; results should be validated against the relevant experiment, simulation, or published model before being used as design limits.

## Available calculators

- [Photon Attenuation Calculator](https://plasma-calculators.github.io/calculators/attenuation-calculator/): attenuation, transmission, and interaction probabilities for materials.
- [Camera Count Estimator](https://plasma-calculators.github.io/calculators/counts-estimation/): estimate camera and detector counts from imaging parameters.
- [Ultrafast Pulse Propagation & Dispersion Calculator](https://plasma-calculators.github.io/calculators/dispersion/): refractive index, GVD, GDD, TOD, pulse broadening, and propagated pulse profiles.
- [Electron Beam Pointing & Divergence Calculator](https://plasma-calculators.github.io/calculators/ebeam-pointing/): beam pointing, divergence, jitter, and screen-based diagnostics.
- [Focal Spot Size & Focus Intensity Calculator](https://plasma-calculators.github.io/calculators/focal-spot-calculator/): focused spot size and intensity estimates.
- [NF/FF Calculator](https://plasma-calculators.github.io/calculators/laser-propagation/): near-field and far-field laser propagation estimates.
- [Laser Spot Size & Gaussian Beam Optics Calculator](https://plasma-calculators.github.io/calculators/laser-spot-size/): Gaussian beam waist, Rayleigh range, divergence, and related optics.
- [Laser Wakefield Acceleration (LWFA) Calculator](https://plasma-calculators.github.io/calculators/lwfa/): laser, plasma, bubble-regime, energy-gain, and validity diagnostics.

Most calculators include a linked equations-and-physics page explaining the formulas, assumptions, and limitations behind the results.

## Technology

The site is built with [Jekyll](https://jekyllrb.com/) and uses HTML, Sass/CSS, and JavaScript calculator engines. It is deployed as a static website through GitHub Pages at [plasma-calculators.github.io](https://plasma-calculators.github.io).

## Origin and base template

This website started from the [Minimal Mistakes Jekyll theme](https://github.com/mmistakes/minimal-mistakes), a responsive Jekyll theme created by Michael Rose and released under the MIT License. The original theme supplied the site structure, layouts, navigation, styling foundation, and responsive behavior. The Plasma Calculators project customizes that foundation with its own calculator pages, physics engines, visual design, navigation, and documentation.

## Local development

The recommended local environment is a micromamba environment named `website`. It keeps Ruby, Node.js, and the command-line tools used by the project separate from the system installation.

### Requirements

- Git
- micromamba
- Ruby 3.3 (provided by the environment below)
- Node.js (used by the calculator tests)
- Bundler 2.5.22 (the version recorded in `Gemfile.lock`)
- A C compiler and `make` for any Ruby gems that need native extensions

### 1. Install micromamba

On macOS with Homebrew:

```bash
brew install micromamba
micromamba shell init --shell zsh --root-prefix ~/micromamba
exec zsh
```

On Linux, use the official installer and restart your shell when it finishes:

```bash
"${SHELL}" <(curl -L micro.mamba.pm/api/micromamba/linux-64/latest)
```

For Apple Silicon, use the `osx-arm64` micromamba build; for Intel macOS, use `osx-64`. See the [micromamba installation documentation](https://mamba.readthedocs.io/en/latest/installation/micromamba-installation.html) if your platform needs a different build.

Check the installation:

```bash
micromamba --version
```

### 2. Create the project environment

From the repository root, create the environment and activate it:

```bash
micromamba create -n website -c conda-forge ruby=3.3 nodejs git make
micromamba activate website
```

Install the Bundler version required by this repository, then install the locked Ruby dependencies into a local bundle directory:

```bash
gem install bundler -v 2.5.22
bundle config set path vendor/bundle
bundle install
```

The `Gemfile` and `Gemfile.lock` install Jekyll, the Minimal Mistakes theme, Sass support, feed/sitemap plugins, and the other build dependencies. Do not edit `Gemfile.lock` just to work around a local version mismatch; use the Bundler version recorded in its `BUNDLED WITH` section.

### 3. Run the website locally

Start the development server with live reload:

```bash
bundle exec jekyll serve --livereload
```

Open <http://localhost:4000>. The calculator pages are available under `/calculators/`, for example <http://localhost:4000/calculators/lwfa/>.

Stop the server with `Ctrl-C`. Run the command from the repository root so Jekyll uses the root `_config.yml` and site content.

### 4. Run tests and build checks

Run the JavaScript calculator tests inside the same environment:

```bash
node --test test/*.test.js
```

Build the site without starting a server:

```bash
bundle exec jekyll build
```

The generated site is written to `_site/`. It is a build artifact and should not be edited manually.

### Optional: graphify development tools

The repository also contains `graphify-out/`, a knowledge graph used for codebase navigation. To install the optional graphify command in the environment:

```bash
micromamba install -n website -c conda-forge python=3.12 pip
micromamba run -n website python -m pip install graphifyy
```

Then query or refresh the graph from the repository root:

```bash
micromamba run -n website graphify query "How does the LWFA calculator render its results?"
micromamba run -n website graphify update .
```

### Troubleshooting

- **`bundle` asks for a different Bundler version:** install `bundler -v 2.5.22` and rerun `bundle install`.
- **A gem fails to compile:** install the platform build tools, especially a C compiler and `make`, then rerun `bundle install`.
- **The port is already in use:** run `bundle exec jekyll serve --livereload --port 4001` and open <http://localhost:4001>.
- **Changes are not visible:** stop and restart the server after changing `_config.yml`, Gemfile files, or Sass configuration; those changes are not always reloaded automatically.

## License

The site-specific calculator code and content are maintained in this repository. The underlying Minimal Mistakes theme is available under the [MIT License](https://github.com/mmistakes/minimal-mistakes/blob/master/LICENSE); see the repository files and upstream project for the applicable licensing details.
