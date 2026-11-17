import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const EXPECTED = ['egm-bootstrap', 'egm-brainstorm', 'egm-draft', 'egm-review', 'egm-review-loop', 'egm-resolve', 'egm-drift-report'];

test('the seven EGM skills are installed and .egm stays untracked', () => {
  const skills = readdirSync(new URL('./.agents/skills/', import.meta.url)).sort();
  assert.deepEqual(skills, [...EXPECTED].sort());
  for (const name of skills) {
    const text = readFileSync(new URL(`./.agents/skills/${name}/SKILL.md`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
    assert.match(text, /^---\nname: /);
    assert.match(text, /^description: /m);
    assert.match(text, new RegExp(`name: ${name}`));
  }
  assert.match(readFileSync(new URL('./.gitignore', import.meta.url), 'utf8'), /^\.egm\/$/m);
  assert.match(readFileSync(new URL('./AGENTS.md', import.meta.url), 'utf8'), /egm-drift-report/);
});
