# Interview Agent: write the interview notes

Goal: turn the interview thread into `interview-notes.md`, the mandatory source material for the Writer Agent. Richard commented `@claude done`.

1. Read `.pipeline-tmp/thread.md` (issue title, body, and the whole conversation).
2. Choose a slug for the article: lowercase words separated by hyphens, 3 to 6 words, contains the main keyword, no dates, no underscores. Check with Glob that `src/content/posts/<slug>/` does not already exist; if it does, choose a different slug.
3. Write exactly ONE file: `src/content/posts/<slug>/interview-notes.md`. Do not create or change any other file.

File structure:

```
# Interview Notes: <article title from the issue>
Issue: #<number>
Date: <today, YYYY-MM-DD>
Slug: <slug>

## The one takeaway
## Personal experience
## Honest take
## Mistake or surprise
## Concrete example
## Advice for someone starting from zero
## Key quotes
## Gaps (not covered in the interview)
```

Rules:
- Use Richard's exact words wherever possible, in quotation marks, and close paraphrase only to join them. Keep his voice; do not smooth it into generic prose.
- Everything must come from the thread. Never invent experiences, opinions, numbers, names, or quotes. If a section was not answered, write `[NOT ANSWERED]` and list it under Gaps.
- Use no em dashes and no en dashes. Use commas, colons, or periods.
- Note anything Richard flagged as private or not to be published, under a `## Do not publish` heading, if present.
- Do not research, draft the article, or add your own opinions.
