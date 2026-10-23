# SPO_DEV_1 — website content (gopas.eu)

> [!NOTE] Editor note
> Each "##" heading below corresponds to one field on the course page; the text under it is
> the content for that field. "Editor note" blocks themselves are not page content — do not
> copy them to the website.
>
> **Status as of 2026-10.** The outline below reflects the prepared course (each day's
> reference solution passes the build). Measured timings from the first delivery
> (2026-10-19 to 2026-10-23) will be added later.

## Delta — what changes versus the currently live page, and why

> [!NOTE] Editor note
> This section is **not** page content. It is the rationale for the approval round.
> The "Currently on the page" column is translated from the Czech page (gopas.cz) as of
> 2026-10-23.

### Factual errors that need fixing

| Currently on the page | New | Reason |
| --- | --- | --- |
| "Node.js LTS, package managers, Yeoman, **Gulp**" | Node.js 22, fnm, Yeoman, **Heft** | Since SPFx 1.22 the project toolchain is **Heft**; gulp is legacy and unsupported from SPFx 1.24. A course that promises gulp sells a tool no new project is created with. |
| "Dependency checks, licences, **polyfill strategy**" | Dependency checks, licences, **runtime baseline** | Microsoft 365 ended IE 11 support and SharePoint Online blocks access from IE 11 and from Edge IE mode. Polyfills for an old browser have no target. |
| "KendoReact overview and **licensing (commercial)**" | KendoReact **13.3.0, Free features only**, optional block | The course works without a licence — 13.3.0 is the last line supporting React 17, which SPFx 1.23 is built on. Commercial licensing is only mentioned. |
| Previous course "C# Programming II [**GOC2125**]" | remove | The course does not use C#. The link attracts the wrong audience. |
| "Building web pages in HTML/**XHTML** and CSS" | "Building web pages in HTML and CSS" | XHTML is irrelevant for the modern web; SPFx components render HTML through React. |
| Audience "**Power users** moving to sustainable, structured development" | "Developers moving from classic SharePoint and Add-ins" | The whole week is written in TypeScript and React. A power user without JS/TS will not keep up. |

### Content changes

| Currently on the page | New | Reason |
| --- | --- | --- |
| 15 modules of 2–2.5 h (~37 h total) | **day-by-day blocks** of varying length, no hours per block | Mandatory content amounts to ~23.75 h of net teaching and labs (day 5 ends at 15:00). Hours per module promised more than physically fits. |
| "Bundle analysis, code splitting, **lazy loading**" | **measured bundle baseline** (day 3) and optimisation **decided by the numbers** (day 4) | We measured lazy loading on the course solution: in both places tried it **increased** the total size (+9.9 KB, +34 KB). The course teaches measuring and deciding, not applying a technique blindly. |
| "Local storage/**IndexedDB**" | comparison of cache storage (memory, `sessionStorage`, IndexedDB) | IndexedDB is a row in a comparison table — what stays on the device and what does not — not a topic of its own. |
| "GitHub Actions / **Azure DevOps** pipeline" | **GitHub Actions**; Azure DevOps as a table of differences | One pipeline is built. The Azure DevOps variant is in the materials as a comparison. |
| "Localisation & multiple languages" (2.5 h) | 45 min, right after the property pane | The `loc/` mechanism is small; it is tested in practice on a second site in another language. 2.5 h was padding. |
| "Telemetry & diagnostics" and "Hardening & governance" as two blocks | **one block: Diagnostics and hardening** | Both answer the same question: is the solution operable and defensible before hand-over. |
| "Security & permissions" as module 9 | **day 3, before PnPjs** | Microsoft Graph does not work without approved permissions; the first App Catalog deployment therefore happens on day 3. |
| "**Code review rubric** & improvement backlog" | **result demo and backlog** with defence of measured numbers | The capstone rests on the day-5 independent lab and on the week's numbers. |
| — (missing) | **one solution all week** (fictional company Vltava Servis) | The course is not a series of Hello World projects. Each block adds a layer to one SPFx solution — web parts, extensions, a full-page app. |
| — (missing) | **independent day-5 lab**: Equipment Desk full-page app | Attendees build an app over two lists with a lookup on their own, following steps — a test that they can actually apply the week. |
| — (missing) | **What SPFx 1.24 and 1.25 bring** | 1.24 moves to React 18 and adds Node.js 24 support; attendees estimate what an upgrade would cost their solution. |
| — (missing) | **debugging on a modern page** instead of the hosted workbench | The hosted workbench is deprecated since SPFx 1.23.0 and retires on 2026-12-01. |
| — (missing) | **environment setup from a bare machine** as a full block | The machine has only VS Code and PowerShell; installation with checkpoints is content, not a prelude. |

## URL

> [!NOTE] Editor note
> The title does not change, so no redirect is needed. The gopas.eu page could not be
> verified on 2026-10-23 (redirect loop) — confirm the existing slug, or create the page.

## Course title

SharePoint Framework (SPFx) – Application Development Fundamentals

## Short description (meta description / teaser)

A hands-on five-day course in modern development for SharePoint Online. From a bare machine
to your own SPFx solution with web parts, extensions and a full-page app — React and Fluent
UI, data through Microsoft Graph and PnPjs, approved API permissions, App Catalog deployment
and a pipeline with tests and a bundle size limit.

## Course description

A five-day course for front-end developers who want to extend SharePoint Online and
Microsoft 365 the modern way — with the SharePoint Framework. **One solution is built all
week** for the fictional company Vltava Servis, and every block adds a layer: a landing page
each department configures itself, an employee directory over Microsoft Graph, an equipment
register over a SharePoint list, a banner and a list action, and finally a full-page app for
issuing equipment.

The course starts **on a bare machine** — installing Node.js and the tools is a full block,
not homework. Then comes project anatomy with the current Heft toolchain, the first web part
on your own site, the property pane, localisation, React and Fluent UI. Day three is about
data: SPHttpClient, MSGraphClientFactory, AadHttpClient and PnPjs, and above all **API
permissions** — who approves them and what happens when they are not approved. Day four
brings extensions, bundle optimisation, and versioning with a solution upgrade. Day five adds
a pipeline with tests, diagnostics and a pre-hand-over review — and an independent lab in
which attendees build an app without the trainer's guidance.

**Everything is measured.** Bundle size is measured on Wednesday, optimised on Thursday and
guarded by the pipeline on Friday. Attendees learn to decide by the numbers — for example,
when lazy loading helps and when it makes the bundle bigger.

One condition holds all week: **data stays in the tenant**. Every API permission must be
approved deliberately, and attendees can say where data from their solution flows.

The course is built on the current SPFx release (as of 2026-10: SPFx 1.23, React 17, Fluent
UI 8, TypeScript, Node.js 22) and shows what SPFx 1.24 will bring.

## Who the course is for

- Front-end developers in Microsoft 365
- Developers moving from classic SharePoint and Add-ins to modern development
- Teams that want to extend a SharePoint Online intranet with their own components

## Prerequisites

- Building web pages in HTML and CSS
- JavaScript basics at the level of JS_PROG1
- TypeScript basics at the level of JS_TS1
- React basics — an advantage
- Familiarity with SharePoint lists and libraries — an advantage

## Format and length

- 5 days, instructor-led with hands-on labs
- level: **moderately advanced**
- code in **TypeScript** (React, Fluent UI)
- each attendee works on their own site in a Microsoft 365 training tenant
- taught in Czech, Slovak or English

> [!NOTE] Editor note
> Price intentionally omitted — GOPAS sales fills it in directly in the CMS/price list.
> Check the language line against what GOPAS actually offers for this course.

## Course outline

### Day 1 — Platform, tools, first web part

- **SPFx in Microsoft 365** — positioning versus Power Platform, Teams apps and Add-ins; code
  runs as the user in their tenant; a short history of pro-code approaches.
- **Development environment from scratch** — Node.js, fnm, git, Yeoman and the SPFx
  generator; environment check by script.
- **Project anatomy** — `package.json`, `tsconfig.json`, `serve.json`, manifests, the Heft
  toolchain and what is inside the `.sppkg` package.
- **First web part** — development server, debugging on a modern page, live changes, property
  pane basics.

### Day 2 — Configuration and UI

- **Property pane and dynamic configuration** — reactive vs. non-reactive fields, validation,
  configuration without a developer.
- **Localisation and multiple languages** — the `loc` folder, fallbacks, testing on a site in
  another language.
- **React and Fluent UI** — versions and compatibility, function components and hooks,
  theming and accessibility, a component structure for the rest of the week; what Fluent UI
  costs in bundle size.
- **KendoReact in SPFx** *(optional block)* — Grid over SharePoint library data, theme next to
  Fluent UI, impact on bundle size.

### Day 3 — Data and permissions

- **SPHttpClient, MSGraphClientFactory, AadHttpClient** — which client when, and what each
  sends.
- **API permissions, admin consent and fallback** — permission requests in the package,
  administrator approval, tenant-wide scope, behaviour on denial; first App Catalog
  deployment.
- **PnPjs** — CRUD over a list, selective projection, batching, error handling.
- **Performance I — measured bundle baseline** — first measured size, dependency analysis.

### Day 4 — Extensions, performance, deployment

- **SPFx Extensions** — Application Customizer, Command Set, Field Customizer; JSON formatting
  as the cheaper alternative; lifecycle and safe DOM handling.
- **Performance II — code splitting, lazy loading, cache** — optimisation decided by
  measurement; caching strategies (memory, session, PnPjs) and what stays on the device.
- **Packaging and the App Catalog** — `.sppkg`, versioning, solution upgrade, tenant vs. site
  deployment.

### Day 5 — Quality and operations

- **CI/CD and quality gates** — GitHub Actions pipeline, lint, unit tests (Jest), translation
  checks, bundle size limit.
- **Diagnostics and hardening** — logging and the Developer Dashboard, performance marks,
  error boundaries; dependency and licence checks, what must not be in the build and where
  data may flow.
- **Equipment Desk — independent lab** — a full-page app over two lists with a lookup, a form
  in a panel, issue and return, concurrent edits.
- **What SPFx 1.24 and 1.25 bring** — React 18, Node.js 24 support, SPFx CLI; estimating the
  upgrade impact on your own solution.
- **Capstone** — result demo, defence of measured numbers, improvement backlog.

### Self-study material

- **TypeScript for SPFx** — the language and its configuration (`tsconfig`, target ECMAScript
  version) for those who want to refresh the course prerequisite.
- Explanatory texts for every day and a reference solution after every block — attendees can
  catch up at any time or compare their state.

## Course outcome

Attendees leave with **their own SPFx solution deployed in the tenant**: web parts with
configuration and two languages, data from Microsoft Graph and SharePoint lists through
approved permissions, a banner and a list action, a full-page app, a versioned package with
an upgrade — and a pipeline that guards tests and bundle size. Plus **measured numbers**
about their solution and the ability to defend technical decisions with them.

## Related courses

> [!NOTE] Editor note
> Update the previous and related course fields.

- Previous: Programming and Algorithm Basics [PRG], JavaScript I: Basics [JS_PROG1],
  TypeScript – Type Checking for JavaScript [JS_TS1], React I: Basics [JS_REACT1],
  JavaScript II: Advanced Techniques [JS_PROG2]
- Related: Extend Microsoft 365 Copilot with declarative agents by using Visual Studio Code
  [MS-4010]; course [SPO_COPILOT] (take the title from the catalogue)

## Before publishing — editor checklist

- [ ] Replace the 15-module outline with hours by the **day-by-day outline** above.
- [ ] Check that neither **"Gulp"** nor **"polyfill strategy"** remains in the text.
- [ ] On the KendoReact block remove "licensing (commercial)" and mark it **optional**.
- [ ] In the audience **replace power users** as above.
- [ ] Remove **GOC2125** from previous courses, add **SPO_COPILOT** to related courses
      (SPFx leads into it through SharePoint Copilot Apps).
- [ ] Use the existing English titles of the related courses from the GOPAS catalogue.
- [ ] Fill in the course price (GOPAS sales).
- [ ] **Check the SPFx version as of the publishing date** — on 2026-10-23, 1.24 was a release
      candidate with GA announced for October 2026. After GA, update the last paragraph of
      the description.
- [ ] Check that no "Editor note" block or delta table was copied into the published text.
