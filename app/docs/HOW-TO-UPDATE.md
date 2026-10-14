# How to update Quilted Languages

Everything you'll change lives in four files — you don't need to write code.
Open Claude Code (or another AI coding assistant) in the `app` folder, copy a
prompt below into it, fill in the lines after the colons, and send it. Each
prompt changes only one file. You can add several items in one prompt: repeat
the block. Then publish the change (see README.md at the top of the repo):
`npm run pages`, commit, push.

| What | File |
|---|---|
| Words (each word, its meaning, where it came from, its sources) | `src/data/words.ts` |
| Your era sections (the text on Home and in the Blog) | `src/data/eras.ts` |
| Teaching materials (Resources page) | `src/data/resources.ts` |
| Page text (title, tag line, Credits names, "Why this project") | `src/content/en.ts` |

Rules the site keeps for you:
- Words without a source still show, with "Sources coming soon". Add the
  source as soon as you have it — that's what makes the site trustworthy.
- A source must have a title and a full `https://` link, or the word hides.
- Disputed words need both views, each with its own source.
- Romanian letters: use **ș ț** (comma below), never ş ţ (cedilla). The site
  refuses to build if a cedilla slips in. An assistant may type the wrong one;
  check after it replies.
- Eras are: Pre-history, 500s CE, 1400s CE, 1600s CE, 1850s CE, 1950s CE,
  2000s CE.

After any change, open the page on your site and check it looks right.

---

## 1. Add a word

```
Add a word to src/data/words.ts. Change nothing else on the site.
Follow the Word type in src/data/types.ts exactly. Use ș and ț with comma
below (U+0219, U+021B), never the cedilla forms. Make the id and slug unique.

Word (as written):
Language: Romanian / Japanese
Script: latin / kana / kanji
Reading in romaji (Japanese only):
Meaning in English (my own short gloss):
Came from (donor language):
Era: Pre-history / 500s / 1400s / 1600s / 1850s / 1950s / 2000s
Contact type (only if my text says): inherited / migration / religion / empire / trade / modern
Source title:
Source link (https://…):
Featured on the homepage: yes / no
```

If the word comes from a language that isn't on the site yet, add to the
prompt: "This donor language is new: give it its own colour and pattern in
NAMED_DONOR_STYLES in src/components/signature/quilt/donors.ts (a colour at
least 3:1 on the page background, a pattern no other donor uses)." Without
it, the new language shares a colour with another one in the quilt.

## 2. Write an era section (Home timeline + Blog)

```
In src/data/eras.ts, fill in the [Romania / Japan] side of the [era] era.
Change nothing else on the site. Keep my text exactly as written.

Blog heading (e.g. "Romanian in the year 500 - Slavic migrations"):
Lead word (its id in words.ts — add the word first with prompt 1):
My paragraph(s):
Other example words (their ids in words.ts):
```

## 3. Add sources to a blog section

```
In src/data/eras.ts, add these sources to the [Romania / Japan] side of the
[era] era (they show at the end of that blog section). Change nothing else.

Source title:
Source link (https://…):
```

## 4. Add a source to a word

```
In src/data/words.ts, add a source to this word's sources list. Change
nothing else on the site.

Word (as written now):
Source title:
Source link (https://…):
```

## 5. Fix a meaning (or any one field)

```
In src/data/words.ts, change one field of one word. Change nothing else on
the site.

Word (as written now):
Field to change: meaning / donor / era / contact type / route
New value:
```

## 6. Mark a word disputed

```
In src/data/words.ts, mark this word as disputed. Change nothing else on
the site. Set confidence to "disputed" and add a views array with one entry
per view, each with its own sources.

Word (as written now):
View 1 (one or two sentences, my own words):
View 1 source title and link:
View 2 (one or two sentences, my own words):
View 2 source title and link:
```

## 7. Add a resource (PDF)

```
Add a resource to src/data/resources.ts. Change nothing else on the site.
I'm uploading the PDF (and a cover image) in this chat: put them in
public/resources/.

Title:
Short description (1–2 sentences):
PDF file name:
Cover image file name (optional):
What the cover shows (for screen readers):
```

## 8. Add a name to the Credits

```
In src/content/en.ts, add a person to credits.people.others. Change
nothing else on the site.

Name (as they want it shown):
What they did:
They agreed to be named on the site: yes
```

---

## If you add Japanese words

The site ships only the parts of the Japanese font it needs. `npm run pages`
adds the new characters by itself, so there is nothing extra to do.

## Changing other page text

```
In src/content/en.ts, replace the text of [home.tagline / home.intro /
home.why.problem / credits.why.goal / …] with the text below, exactly as
written. Change nothing else on the site.

[your text]
```
