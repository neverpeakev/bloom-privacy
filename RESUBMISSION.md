# WorldCopa — Resubmission after rejection (Guidelines 4.3a + 5.2.1)

## What Apple flagged
1. **5.2.1 (Legal – Intellectual Property):** app/metadata resembled FIFA/World Cup
   without authorization.
2. **4.3a (Design – Spam):** looked similar in concept/metadata to other apps
   (the wave of unofficial "World Cup 2026" companion apps).

## What changed in this build
- Removed **every** "FIFA", "World Cup", and "Copa Mundial" reference from the app
  UI and from all App Store metadata (name, subtitle, keywords, description,
  promo text, release notes).
- Keywords no longer contain "world cup", "copa mundial", or "mundial".
- Renamed the in-app "World Cup" section to a generic **Soccer / Teams** hub; the
  schedule is now presented as an *independent fan calendar of publicly available
  match dates*, not an official tournament product.
- Added a clear disclaimer in the app (Soccer hub, Grown-ups → About) and in the
  store description and privacy policy: *"Not affiliated with, endorsed by, or
  sponsored by FIFA or any tournament organizer."*
- The app's substance is original: a flag-coloring engine, geography trivia,
  Flag Match, Continent Quest and a passport — all built on public-domain
  national flags and public geographic facts.

## Reply to paste into Resolution Center (App Store Connect)

> Thank you for the review. We have addressed both points:
>
> **5.2.1 — Intellectual Property:** We have removed all references to FIFA, the
> World Cup, and Copa Mundial from the app and from every piece of metadata
> (name, subtitle, keywords, description, promotional text). The app no longer
> presents itself as an official or unofficial tournament product. The soccer
> section is now a generic team/geography explorer, and any match dates shown are
> publicly available factual information presented as an independent fan calendar.
> We have added an explicit disclaimer in the app and in the description stating
> that WorldCopa is not affiliated with, endorsed by, or sponsored by FIFA or any
> tournament organizer. The national flags used are in the public domain.
>
> **4.3a — Spam:** WorldCopa is a single, original app developed by us. It is not
> built from a repackaged template or a third-party app generator, and we have no
> other similar apps on the store. Its core is a custom flag-coloring engine plus
> original geography learning games (Trivia Arena, Flag Match, Continent Quest,
> passport/badges). With the tournament framing removed, the app stands on its own
> as a kids' geography and coloring game. We are happy to provide any additional
> information needed.

## Steps to resubmit
1. Merge this branch to `main` (PWA on GitHub Pages updates automatically).
2. Run the **iOS – TestFlight** workflow to produce a new build (new build number).
3. In App Store Connect, attach that build to the version, and the metadata in
   `fastlane/metadata/en-US/` will be delivered by the **iOS – Submit** workflow
   (`release` lane), or update the fields manually to match these files.
4. Paste the Resolution Center reply above and Submit for Review.

## Residual risk / fallback
The brand name **WorldCopa** ("copa" = "cup") is a coined word and not a verbatim
trademark, so it is kept. If a reviewer still objects to the name under 5.2.1, the
fastest fix is a rename (e.g., **FlagFiesta**, **Flagtastic**, **Globe Coloring**)
— only the display name, App Store name, and `manifest`/`index` titles need to
change; bundle ID, RevenueCat, and the App Store record stay the same.
