#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'www');
const SKILLS_DIR = path.join(ROOT, 'skills');
const OUT = path.join(ROOT, 'skills-data.js');
const REQUIRED = ['id', 'name', 'category', 'pack', 'type', 'description'];
const PACKS = ['everyday', 'dev', 'bonus'];
const TYPES = ['guide', 'checklist', 'prompt', 'snippet', 'workflow', 'reference'];

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return e.name === 'SKILL.md' ? [p] : [];
  });
}

function parseValue(v) {
  v = v.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
  }
  return v.replace(/^["']|["']$/g, '');
}

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('missing frontmatter');
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    meta[line.slice(0, i).trim()] = parseValue(line.slice(i + 1));
  }
  return { meta, body: m[2].trim() };
}

function main() {
  if (!fs.existsSync(SKILLS_DIR)) throw new Error(`Missing folder: ${SKILLS_DIR}`);
  const seen = new Set();
  const skills = [];
  const errors = [];

  for (const file of walk(SKILLS_DIR)) {
    const rel = path.relative(ROOT, file);
    try {
      const { meta, body } = parse(file);
      const missing = REQUIRED.filter((k) => !meta[k]);
      if (missing.length) throw new Error(`missing field(s): ${missing.join(', ')}`);
      if (!PACKS.includes(meta.pack)) throw new Error(`bad pack "${meta.pack}"`);
      if (!TYPES.includes(meta.type)) throw new Error(`bad type "${meta.type}"`);
      if (seen.has(meta.id)) throw new Error(`duplicate id "${meta.id}"`);
      seen.add(meta.id);
      skills.push({
        id: meta.id,
        name: meta.name,
        category: meta.category,
        pack: meta.pack,
        type: meta.type,
        description: meta.description,
        tags: toArray(meta.tags),
        related: toArray(meta.related),
        version: meta.version || '1.0.0',
        body,
      });
    } catch (err) {
      errors.push(`${rel}: ${err.message}`);
    }
  }

  if (errors.length) {
    console.error('Skill errors:\n' + errors.map((e) => ' - ' + e).join('\n'));
    process.exit(1);
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(OUT, `window.SKILLS = ${JSON.stringify(skills)};\n`);
  console.log(`Wrote ${skills.length} skills -> ${path.relative(process.cwd(), OUT)}`);
}

main();
