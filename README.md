# studyplug

TypeScript SDK for the [StudyPlug API](https://api.studyplug.org) — generate educational content for K-8 math, reading, vocabulary, spelling, and science.

[![npm version](https://img.shields.io/npm/v/studyplug.svg)](https://www.npmjs.com/package/studyplug)
[![license](https://img.shields.io/npm/l/studyplug.svg)](https://github.com/9001-Solutions/study-plug/blob/master/LICENSE)

## Install

```bash
npm install studyplug
```

## Quick Start

```typescript
import { StudyPlug } from "studyplug";

const sp = new StudyPlug({ apiKey: "sp_live_..." });

// Generate 5 addition problems
const { data } = await sp.generate({ skill: "add-within-10", count: 5 });
console.log(data.items);

// Generate a single problem
const single = await sp.generate.single({ skill: "add-within-20" });
console.log(single.data.item);
```

## Features

- **Zero dependencies** — lightweight, works everywhere
- **Full TypeScript support** — every response is fully typed
- **Structured errors** — typed error classes with helper functions
- **Curriculum catalog** — browse grades, subjects, topics, skills, and standards
- **Deterministic generation** — pass a `seed` for reproducible content

## Browse the Curriculum

```typescript
// List all grades
const grades = await sp.grades.list();

// List skills for a grade/subject
const skills = await sp.skills.list({ grade: "grade-3", subject: "math" });

// Get skill details
const skill = await sp.skills.get("multiply-by-5");

// Find skills by standard
const standards = await sp.standards.list({ framework: "ccss-math" });
```

## Error Handling

```typescript
import { StudyPlug, isRateLimitError, isNotFoundError } from "studyplug";

try {
  const result = await sp.generate({ skill: "add-within-10", count: 5 });
} catch (err) {
  if (isRateLimitError(err)) {
    console.log(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (isNotFoundError(err)) {
    console.log("Skill not found");
  }
}
```

## API Reference

| Method | Description |
|--------|-------------|
| `sp.generate(params)` | Generate a batch of content items |
| `sp.generate.single(params)` | Generate a single content item |
| `sp.grades.list()` | List all grades |
| `sp.grades.get(slug)` | Get grade details |
| `sp.subjects.list()` | List all subjects |
| `sp.subjects.get(slug)` | Get subject details |
| `sp.topics.list(params?)` | List topics (optionally filtered) |
| `sp.skills.list(params?)` | List skills (optionally filtered) |
| `sp.skills.get(slug)` | Get skill details |
| `sp.standards.list(params?)` | List standards |
| `sp.standards.get(code)` | Get standard details |
| `sp.health()` | API health check |

## Configuration

```typescript
const sp = new StudyPlug({
  apiKey: "sp_live_...",               // optional for anonymous tier
  baseUrl: "https://api.studyplug.org", // default
  timeout: 10000,                       // ms, default 30000
});
```

## Links

- [Documentation](https://docs.studyplug.org)
- [API Reference](https://docs.studyplug.org/api-reference/)
- [GitHub](https://github.com/9001-Solutions/study-plug)
- [Request an API Key](https://docs.studyplug.org/request-key/)

## License

MIT
