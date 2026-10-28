#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'www');
const SKILLS_DIR = path.join(ROOT, 'skills');
const RES_DIR = path.join(ROOT, 'resources');
const SKILLS_OUT = path.join(ROOT, 'skills-data.js');
const RES_OUT = path.join(ROOT, 'resources-data.js');
const REQUIRED = ['id', 'name', 'category', 'pack', 'type', 'description'];
const PACKS = ['everyday', 'dev', 'bonus', 'research'];
const TYPES = ['guide', 'checklist', 'prompt', 'snippet', 'workflow', 'reference'];
const RES_ID = /^[a-z0-9][a-z0-9-]*$/;

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

function loadSkills(errors) {
  if (!fs.existsSync(SKILLS_DIR)) throw new Error(`Missing folder: ${SKILLS_DIR}`);
  const seen = new Set();
  const skills = [];
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
        resources: toArray(meta.resources),
        version: meta.version || '1.0.0',
        body,
      });
    } catch (err) {
      errors.push(`${rel}: ${err.message}`);
    }
  }
  return skills;
}

function loadResources(errors) {
  const out = { categories: {}, resources: [] };
  if (!fs.existsSync(RES_DIR)) return out;
  const seen = new Set();
  const files = fs.readdirSync(RES_DIR).filter((f) => f.endsWith('.json')).sort();
  for (const file of files) {
    const rel = path.join('resources', file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(RES_DIR, file), 'utf8'));
    } catch (err) {
      errors.push(`${rel}: invalid JSON (${err.message})`);
      continue;
    }
    if (!data || !PACKS.includes(data.pack)) {
      errors.push(`${rel}: bad pack "${data && data.pack}"`);
      continue;
    }
    if (!Array.isArray(data.resources)) {
      errors.push(`${rel}: "resources" must be an array`);
      continue;
    }
    const cats = {};
    Object.entries(data.categories || {}).forEach(([id, v]) => {
      if (Array.isArray(v) && typeof v[0] === 'string') {
        cats[id] = [v[0], typeof v[1] === 'string' ? v[1] : '📄'];
      } else {
        errors.push(`${rel}: bad category "${id}"`);
      }
    });
    Object.assign(out.categories, cats);
    data.resources.forEach((r, i) => {
      const where = `${rel} #${i + 1}${r && r.id ? ' (' + r.id + ')' : ''}`;
      const problems = [];
      ['id', 'name', 'url', 'category', 'desc'].forEach((k) => {
        if (!r || typeof r[k] !== 'string' || !r[k].trim()) problems.push(`missing ${k}`);
      });
      if (!problems.length) {
        if (!RES_ID.test(r.id)) problems.push('bad id');
        if (seen.has(r.id)) problems.push('duplicate id');
        if (!/^https:\/\/\S+$/.test(r.url)) problems.push('url must start with https://');
        if (!cats[r.category]) problems.push(`unknown category "${r.category}"`);
      }
      if (problems.length) {
        errors.push(`${where}: ${problems.join(', ')}`);
        return;
      }
      seen.add(r.id);
      out.resources.push({
        id: r.id,
        name: r.name,
        url: r.url,
        category: r.category,
        desc: r.desc,
        tags: toArray(r.tags),
        pack: data.pack,
      });
    });
  }
  return out;
}

function main() {
  const errors = [];
  const skills = loadSkills(errors);
  const res = loadResources(errors);

  if (errors.length) {
    console.error('Build data errors:\n' + errors.map((e) => ' - ' + e).join('\n'));
    process.exit(1);
  }

  const resIds = new Set(res.resources.map((r) => r.id));
  skills.forEach((s) => {
    s.resources
      .filter((id) => !resIds.has(id))
      .forEach((id) => console.warn(`warning: skill "${s.id}" links unknown resource "${id}"`));
  });

  skills.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(SKILLS_OUT, `window.SKILLS = ${JSON.stringify(skills)};\n`);
  fs.writeFileSync(RES_OUT, `window.RESOURCES = ${JSON.stringify(res)};\n`);
  console.log(`Wrote ${skills.length} skills and ${res.resources.length} resources`);
}

main();
