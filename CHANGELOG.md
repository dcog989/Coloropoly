# Changelog
All notable changes to this project will be documented in this file. See [conventional commits](https://www.conventionalcommits.org/) for commit guidelines.

- - -
## v3.11.3 - 2026-11-21
#### Bug Fixes
- (**ci**) ignore unpatched picomatch ReDoS advisory in audit - (4aedadc) - dcog989
#### Continuous Integration
- install just in the test and deploy jobs - (7e1cc15) - dcog989
#### Miscellaneous Chores
- (**build**) call just from the git hooks - (ecedae8) - dcog989
- (**build**) call just from the git hooks - (60da83b) - dcog989
- (**build**) close the remaining raw-command gaps - (5d42b9d) - dcog989
- (**build**) call the just recipes from CI, hooks and docs - (eb32455) - dcog989
- (**build**) wrap the remaining dev scripts in just - (3463a7a) - dcog989
- (**build**) add an update recipe - (76e92c4) - dcog989
- (**build**) add a justfile for the common dev tasks - (23d9404) - dcog989
- (**cog**) drop the custom changelog template - (6cc88b9) - dcog989
- (**deps**) bump taiki-e/install-action from 2.90.3 to 2.90.5 - (5bcff30) - dependabot[bot]
- (**deps**) bump taiki-e/install-action from 2.87.31 to 2.90.3 - (54589d4) - dependabot[bot]
- updates - (bed499f) - dcog989
- colour -> color, refine website desc - (22ed700) - dcog989

- - -

## v3.11.2 - 2026-11-14

#### Bug Fixes

- (c7348f8) use the theme text colour for the spinning arc - dcog989

- (9decbeb) keep search results visible and focus the query field - dcog989

#### Performance Improvements

- (d2a577b) cache the built color-name index in IndexedDB - dcog989
- - -

## v3.11.1 - 2026-11-14

#### Bug Fixes

- (639ab39) keep chroma and saturation when lightness hits black or white - dcog989

#### Miscellaneous Chores

- (79a716b) tidy directory file - dcog989
- - -

## v3.11.0 - 2026-11-14

#### Features

- (cf61bd6) add collapse toggles to the secondary panels - dcog989

#### Bug Fixes

- (34de759) hash the color in the picker's current mode - dcog989

- (6e36ad3) title the page Coloropoly Color Toolbox - dcog989

#### Miscellaneous Chores

- (f5ef60e) update screenshot - dcog989
- - -

## v3.10.0 - 2026-11-14

#### Features

- (2798e20) load the color name list once the app is idle - dcog989

- (6683637) download plain JSON - dcog989

- (f428123) replace native tooltips with app-styled tooltips - dcog989

- (619e9a5) select the current color when a swatch is clicked - dcog989

- (fe14f75) enlarge the color input text - dcog989

- (037f9ad) integrate curated palette browser into the app - dcog989

#### Bug Fixes

- (912204e) restore the swatch name and value tooltips - dcog989

- (2e7dcc4) drop the trailing zero from whole WCAG ratios - dcog989

- (b498689) deploy only trusted pushes on main - dcog989

- (e15a62c) show both modifier keys in the shortcut help - dcog989

- (d2425c4) crossfade the title when the color name changes - dcog989

- (04a5b64) keep the focus ring visible on transparent colors - dcog989

- (b5bdfd3) announce loading and stop the spinner for reduced motion - dcog989

- (de3b14d) anchor fixed modals and toasts to the viewport - dcog989

- (dda7e63) show keyboard-triggered toasts and announce them - dcog989

- (6b6700e) tidy the filter and the swatch row - dcog989

- (4d27b4f) keep footer text readable and Ctrl+R reloading - dcog989

- (7fec20e) reject oversized rasters before decoding - dcog989

- (985f21e) ask before evicting and save on every change - dcog989

- (d0f5267) parse string tokens with the app color normalizer - dcog989

- (9786fe8) disable copying when the filter matches nothing - dcog989

- (7617180) make every export complete and uniquely named - dcog989

- (53acacf) flatten alpha and tighten the checker - dcog989

- (2f9c573) fit long titles and fold duplicate strategies - dcog989

- (dc4af45) keep the preview aspect and cover the supersede guard - dcog989

- (efda1fa) keep palette and slider values truthful - dcog989

- (36a80a2) stop silent colour loss - dcog989

- (06bdfe0) drop the redundant Set label - dcog989

- (9d6362e) keep pixel specks out of the extracted palette - dcog989

- (2ee9803) warn before Add All evicts saved paintbox colors - dcog989

- (883b5a3) decode SVG uploads through an image element - dcog989

- (0f52592) confirm clearing and report the import cap honestly - dcog989

- (3976e77) keep saved colors in full gamut and across tabs - dcog989

- (1bec6e0) keep the remove button off touch targets - dcog989

- (57d2b10) disable add row at the step limit - dcog989

- (9c46e6a) stop the title marquee for reduced motion and keep it mounted - dcog989

- (33dd377) type worker messages and reuse the palette util - dcog989

- (e63f4bd) keep generated steps distinct and in gamut - dcog989

- (8b704e3) draw rgb ramps from the current color - dcog989

- (9e56e51) show values on focus, label the input, and keep shared links exact - dcog989

- (ee2310e) keep an explicitly set hue on neutral colors - dcog989

- (915680f) reveal hover controls on focus and label fields - dcog989

- (0db551b) ignore errors from superseded uploads - dcog989

- (eabe3c6) cap imported colors before adding them - dcog989

- (85b66e5) say when the color search is capped - dcog989

- (1219283) keep the current alpha in harmony palettes - dcog989

- (94eeb69) restore the full color from the hash - dcog989

- (102845a) escape color names in SVG exports - dcog989

- (f97e1cd) show a single focus ring on text inputs - dcog989

- (b80dac2) pick on-color text with APCA instead of the WCAG ratio - dcog989

- (8805189) move the color set picker before the filter input - dcog989

- (61fe078) reduce the color input padding to match the other fields - dcog989

- (14040b1) announce toasts and show overlay controls on focus - dcog989

- (98e47ea) tell the color library when the search worker fails - dcog989

- (b019873) match the app text contrast rule and keep SVG alpha - dcog989

- (ba1ded9) drop stale palettes, decode smaller, and allow retry - dcog989

- (bc75cfe) reload saved colors when another tab changes them - dcog989

- (f1eb4a3) handle blocked storage and follow OS changes - dcog989

- (af89a50) guard storage access and debounce hash writes - dcog989

- (ae2c9a4) match control group height to the select controls - dcog989

- (45dc75b) match small button height to the select controls - dcog989

- (2d42dc1) ui refined - dcog989

- (cf0b2a8) include the copied value in swatch copy tooltips - dcog989

#### Performance Improvements

- (7bac07a) reuse one collator for the name sort - dcog989

- (9541c6c) share one viewport listener across tooltips - dcog989

- (bb69cf9) register plugins once and defer the name list - dcog989

- (8ac9e6f) cache processed colors and drop the unused set name - dcog989

#### Refactoring

- (a5318c8) simplify version sync and drop the duplicate pre-push check - dcog989

- (7793a3b) drop the duplicate hue memory - dcog989

- (ce3d4ab) drop duplicated dark-mode media queries - dcog989

- (b3889ac) drive vision filters from one shared list - dcog989

- (27723f3) drop the unused extensions field and a no-op alpha check - dcog989

- (6c4af8c) drop unreachable mode guards - dcog989

- (074b24e) reuse the shared copy helper and palette limit - dcog989

- (ce3f8f1) move formatting and name search into tested utils - dcog989

#### Documentation

- (26f5191) note that cog is needed for the installed git hooks - dcog989

- (7d9728a) describe the image clusterer as histogram clustering - dcog989

- (65022a1) document the color sets integration - dcog989

#### Continuous Integration

- (d7f5a70) pin bun and drop the node_modules cache - dcog989

- (e62613d) install from the lockfile - dcog989

#### Tests

- (264cac6) cover saved, system and toggle theme rules - dcog989

- (844918a) cover the palette loader - dcog989

- (aaaaf88) cover parsing, gamut mapping and formatting - dcog989

#### Style

- (2266ffb) center the section title with the controls - dcog989

- (5785c17) consistency! - dcog989

#### Miscellaneous Chores

- (933df9b) rebrand to Coloropoly - dcog989

- (4ee5176) pin the local bun, keep the lockfile and trim the TypeScript config - dcog989

- (b14e586) drop redundant @tailwindcss/node devDependency - dcog989

- (c0855a3) drop redundant @tailwindcss/node devDependency - dcog989

- (7384004) package updates, agents.md refined - dcog989
- - -

## v3.9.5 - 2026-11-05

#### Bug Fixes

- (9a58a2b) label WCAG metric card "WCAG" instead of "Ratio" - dcog989

#### Miscellaneous Chores

- (60adfbb) package updates - dcog989
- - -

## v3.9.4 - 2026-11-01

#### Bug Fixes

- (c244bee) load the plugins each module needs - dcog989

- (235b1cd) batch URL writes and lock the page behind dialogs - dcog989

- (2b2430a) make modals real dialogs and stop nesting buttons - dcog989

- (4a108a2) stop retrying one-shot analysis jobs - dcog989

- (25a4f0c) avoid the pending name and reserve space for the PNG title - dcog989

- (f0a06ff) verify imports, dedupe by color and keep the newest colors - dcog989

- (045b818) measure the normalized custom color - dcog989

- (6eb5b02) keep the virtual list aligned and reset scroll on search - dcog989

- (137cd34) replace hsl() fills with hex so Qt-based thumbnails show colors - dcog989

#### Refactoring

- (39f66b6) move palette ordering into a tested helper - dcog989

- (e4f9897) drop PDF export and jspdf - dcog989

#### Documentation

- (3ab5150) correct and complete the readme and agent directives - dcog989

#### Continuous Integration

- (db86e55) ignore unfixable deepmerge advisory in bun audit - dcog989

#### Miscellaneous Chores

- (ec94d71) cover the paintbox helpers and gate all logic files - dcog989

- (44668dd) prune dead code and cover the extracted clustering logic - dcog989

- (37e0db9) package updates - dcog989

- (81ba7a1) add .directory to root - dcog989

- (a0c4c61) attach changelog asset and list every commit type in release notes - dcog989

- (055157e) bump taiki-e/install-action from 2.87.29 to 2.87.31 - dependabot[bot]
- - -

## v3.9.3 - 2026-10-21
- - -

## v3.9.2 - 2026-10-16

#### Bug Fixes

- (ab262b5) show APCA score in every mode tab - dcog989
- - -

## v3.9.1 - 2026-10-15

#### Bug Fixes

- (b6b5d1a) show okhsl/oklch channels as decimals to match output - dcog989
- - -

## v3.9.0 - 2026-10-15

#### Features

- (9fe21d4) format picker values to the active precision mode - dcog989

- (5c2f48e) accept all colordx input formats in the picker - dcog989

#### Bug Fixes

- (f31eeae) make alpha slider honour precise mode - dcog989

- (7e91be9) round rgb alpha to the active precision - dcog989

- (5a52ebf) apply shared percent precision to hsv/hwb and the rest - dcog989

- (4241439) avoid undefined regex groups in okhsl normalizer - dcog989

- (69cf84e) normalize input field after paste when color is unchanged - dcog989

- (2a69976) scale okhsl/okhsv 0..1 fraction input to percentages - dcog989

- (19464f9) accept legacy comma-separated okhsl/oklch/oklab/lab/hwb input - dcog989

#### Refactoring

- (b77bbae) fold rgb decimals into the shared DECIMALS table - dcog989
- - -

## v3.8.1 - 2026-10-12

#### Bug Fixes

- (b71ad44) retry the analysis worker and surface failures instead of silently aborting - dcog989

- (25f9f12) drop the precision toggle tooltip below the trigger so the panel doesn't clip it - dcog989

- (a8ec612) honour precision toggle when copying palette swatch colors - dcog989

- (86e5fbb) checkerboard magic numbers - dcog989

#### Refactoring

- (ed9d573) add ellipsis to code button - dcog989
- - -

## v3.8.0 - 2026-10-10

#### Features

- (7e65a1c) add per-mode invert toggle to tabs - dcog989

#### Bug Fixes

- (895e7ba) narrow genAxis with the harmony guard so generated() typechecks - dcog989

- (89a7ceb) remove no-op system-ui font-face from critical CSS - dcog989

- (776a3aa) stop tsc emitting vite.config.d.ts into the repo root - dcog989

- (28d561d) use an explicit sourcemap mode instead of a dead NODE_ENV check - dcog989

- (67dd266) correct og:image URL and declare image metadata - dcog989

- (e37854a) handle clipboard write failures instead of ignoring the promise - dcog989

- (82f1d06) stop duplicate page requests while a page load is in flight - dcog989

- (7b52f94) ignore stale analysis results after clear or a newer file - dcog989

- (aba608f) keep the remembered hue when chroma is raised from zero - dcog989

- (22b1a76) fall back to the color hex when the closest name is pending or blank - dcog989

- (d2c3abc) make DTCG color walker iterative to avoid stack overflow on deep JSON - dcog989

- (dd592c8) clamp hue to [0, 359.999] in the h setter and setOkhslValues - dcog989

- (ae0357a) dispose the color-name debounce effect on destroy via $effect.root - dcog989

- (193973f) bound color-name data wait with a timeout instead of polling forever - dcog989

- (8de06e6) build dense aligned color-name arrays so list holes never yield undefined entries - dcog989

- (248de66) stop persist effect mutating the colors state it reads on quota overflow - dcog989

- (e6063b0) emit uniform 8-digit hex from generatePalette to stop mixed alpha output - dcog989

- (a9ee869) preserve single-color alpha by using hexa instead of hex in getColorSource - dcog989

- (f457a4e) cancel pending retry timer on teardown and reset retry budget on init - dcog989

- (3f3d2ac) bind dark: variant to app theme class instead of OS preference - dcog989

- (cc702ac) unify disabled button styling on one global rule - dcog989

- (0b2761f) use shared .icon-button for the precision toggle so hover text stays legible - dcog989

- (74441f7) use contrast-aware on-current text color for current-color hover states - dcog989

- (3364642) size the grid rows to panel content - dcog989

- (33d29a8) center and enlarge the custom-color swatch - dcog989

- (4b85aaf) restore keyboard focus indicator on range sliders - dcog989

- (4b6d1e5) resolve text-on-current from one token - dcog989

#### Performance Improvements

- (0834386) check the sRGB gamut directly instead of parsing an object per iteration - dcog989

- (a72d824) check sRGB gamut with oklchToLinearInto instead of parsing an object per iteration - dcog989

- (7fd02fa) mutate slider state in place so unchanged gradient ramps are not rebuilt - dcog989

- (8b670d9) cache rgbComp as a derived value instead of a getter - dcog989

- (4e92021) parse the current color once for both APCA contrast values - dcog989

- (88d58b8) parse each color once for palette sorting instead of per comparison - dcog989

- (de516a9) precompute lowercased color names for search filtering - dcog989

- (18df6c4) drop unused duplicate colors array from analysis worker payload - dcog989

- (cef025a) cache oklch conversion in a single $derived instead of recomputing per read - dcog989

- (fa394ba) build color-name coordinates with low-level parseHex/rgbToOklab - dcog989

#### Refactoring

- (e07f09a) drop redundant cssMinify option - dcog989

- (1ee836f) drop esbuild minifier in favour of Vite 8's default OXC - dcog989

- (7a4a84b) drop deprecated rollupOptions output block relying on Vite defaults - dcog989

- (b9c4b63) drop redundant contrast try/catch and reuse the harmony-mode derived - dcog989

- (12667a7) extract value-button reveal host, dedupe copy-value buttons - dcog989

- (c3958e1) add small-button base, dedupe ExportModal button chrome - dcog989

- (5f182f4) extract icon-button-inset variant for control-group steppers - dcog989

- (ae8019a) move panel scroll container (h-full overflow-y-auto) into .panel base - dcog989

- (1834a76) add shared segment/tab control bases, drive state via aria - dcog989

- (85b3028) extract shared .footer-link and .footer-divider classes - dcog989

- (a4aa494) route remaining small-caps labels through the shared label classes - dcog989

- (f7cbb6b) drop duplicate global transition rule and the transition-colors override - dcog989

- (e05801a) remove per-call-site radius overrides from segmented controls - dcog989

- (32af9ef) remove unused animation utility classes and keyframes - dcog989

- (612de1b) drop --color-brand alias and use --current-color directly - dcog989

- (6c4de12) align ExportModal with shared modal panel/title and Svelte transitions - dcog989

- (8c98b68) extract shared .overlay-button and .value-reveal from swatch and copy actions - dcog989

- (1f48c01) extract shared .control-group shell for mode, stepper and contrast tab groups - dcog989

- (8ec73dc) route small-caps labels through .section-heading and new .sub-label - dcog989

- (096933d) extract shared .text-input chrome for picker, contrast and library fields - dcog989

- (3fcc54d) extract shared .select-control class for palette, paintbox and export selects - dcog989

- (424ea48) remove redundant comparison caption - dcog989

- (d09dfd4) use the CSS-variable shorthand for injected info classes - dcog989

- (282eb45) replace actionButtonClass string with a .action-button base - dcog989

- (088cd6b) drop per-element will-change-transform duplicates - dcog989

- (d052baf) move the 1920px grid into Tailwind utilities - dcog989

- (594d5cf) extract shared button and modal chrome bases - dcog989

- (76d38fd) extract shared .section-heading base class - dcog989

- (53d7624) extract shared panel shell into a .panel base class - dcog989

- (de30592) drop custom scrollbar styling - dcog989

- (5de5292) remove duplicate body background write - dcog989

- (558c733) unify focus styling on the global :focus-visible outline - dcog989
- - -

## v3.7.1 - 2026-10-06
- - -

## v3.7.0 - 2026-10-06

#### Features

- (0348569) add DTCG design-tokens and GIMP GPL import/export - dcog989

#### Bug Fixes

- (306d01d) show a single row by default instead of two - dcog989

#### Refactoring

- (9ebb4da) rebrand to 'color-picker-palette' - dcog989
- - -

## v3.6.1 - 2026-10-04
- - -

## v3.6.0 - 2026-09-28

#### Features

- (218edd6) default to OKHSL picker and track sRGB gamut chroma in OKLCH - dcog989
- - -

## v3.5.3 - 2026-09-25

#### Bug Fixes

- (2062c05) show real decimal RGB channels in precise mode - dcog989

#### Refactoring

- (a60ca2b) randomize hue at fixed OKLCH L/C - dcog989

- (abd9b5a) generate random colors in OKLCH with perceptual lightness - dcog989

- (3e23aa2) use @colordx/core/fn rgbToHex - dcog989
- - -

## v3.5.2 - 2026-09-23

#### Bug Fixes

- (ed9f345) preserve hue/saturation when lightness hits 0 or 100 - dcog989

#### Refactoring

- (289895a) use colordx contrast instead of OKLCH lightness cutoffs for text color - dcog989

- (1006324) use colordx isReadable for WCAG pass/fail checks - dcog989

- (a9a05cb) replace hand-rolled CSS name table with colordx names plugin - dcog989
- - -

## v3.5.1 - 2026-09-22

#### Refactoring

- (e8680bf) use colordx okhsl plugin, drop custom OKHSL util - dcog989
- - -

## v3.5.0 - 2026-09-21

#### Features

- (26bd2c8) add HWB and OKHSL copy formats, relabel LAB to CIELAB - dcog989
- - -

## v3.4.7 - 2026-09-16
- - -

## v3.4.6 - 2026-09-05
- - -

## v3.4.5 - 2026-09-05
- - -

## v3.4.4 - 2026-09-02
- - -

## v3.4.3 - 2026-09-02

#### Bug Fixes

- (4dc04e1) package clean script - dcog989
- - -

## v3.4.2 - 2026-08-31

#### Bug Fixes

- (57646d9) allow onError handler without an error event - dcog989
- - -

## v3.4.1 - 2026-08-31
- - -

## v3.4.0 - 2026-08-31

#### Features

- (a5ef64a) add dynamic color URL sync with shareable links - dcog989

#### Bug Fixes

- (6f00579) stop header hanging on 'Searching...' when worker is slow or errors - dcog989

- (5c3db02) enforce coverage thresholds, block audit failures, drop stale vite externals - dcog989
- - -

## v3.3.3 - 2026-08-31
- - -

Changelog generated by [cocogitto](https://github.com/cocogitto/cocogitto).