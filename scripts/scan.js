#!/usr/bin/env node
/*
  Lightweight repository scanner for Relocation-Z-2025.
  - Validates core files exist
  - Checks HTML references to local assets
  - JS syntax check
  - Basic CSS sanity check
*/

const fs = require('fs');
const path = require('path');

function exitWith(statusCode, message) {
  if (message) {
    console.log(message);
  }
  process.exit(statusCode);
}

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return `Missing required file: ${filePath}`;
  }
  return null;
}

function checkRequiredFiles(projectRoot) {
  const errors = [];
  const required = [
    path.join(projectRoot, 'index.html'),
    path.join(projectRoot, 'assets', 'style.css'),
    path.join(projectRoot, 'assets', 'script.js'),
  ];
  for (const filePath of required) {
    const err = assertExists(filePath);
    if (err) errors.push(err);
  }
  return errors;
}

function extractLocalRefsFromHtml(htmlContent) {
  const refs = [];
  const srcRegex = /\b(?:src|href)=["']([^"']+)["']/gi;
  let match;
  while ((match = srcRegex.exec(htmlContent)) !== null) {
    const ref = match[1];
    // Skip absolute URLs, data URIs, in-page anchors, and protocol-relative URLs
    if (/^https?:\/\//i.test(ref)) continue;
    if (/^data:/i.test(ref)) continue;
    if (/^#/i.test(ref)) continue;
    if (/^\/\//.test(ref)) continue;
    if (!ref.trim()) continue;
    if (ref.startsWith('mailto:') || ref.startsWith('tel:')) continue;
    if (ref.startsWith('javascript:')) continue;
    {
      refs.push(ref.split('?')[0]);
    }
  }
  return refs;
}

function checkHtmlAssetRefs(projectRoot) {
  const filePath = path.join(projectRoot, 'index.html');
  const errors = [];
  if (!fs.existsSync(filePath)) return errors;
  const html = fs.readFileSync(filePath, 'utf8');
  const refs = extractLocalRefsFromHtml(html);
  for (const ref of refs) {
    const resolved = path.join(projectRoot, ref);
    if (!fs.existsSync(resolved)) {
      errors.push(`index.html references missing asset: ${ref}`);
    }
  }
  return errors;
}

function checkJavaScriptSyntax(projectRoot) {
  const filePath = path.join(projectRoot, 'assets', 'script.js');
  const errors = [];
  if (!fs.existsSync(filePath)) return errors;
  try {
    new Function(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    errors.push(`JS syntax error in assets/script.js: ${e.message}`);
  }
  return errors;
}

function checkCssBalance(projectRoot) {
  const filePath = path.join(projectRoot, 'assets', 'style.css');
  const errors = [];
  if (!fs.existsSync(filePath)) return errors;
  const css = fs.readFileSync(filePath, 'utf8');
  const open = (css.match(/\{/g) || []).length;
  const close = (css.match(/\}/g) || []).length;
  if (open !== close) {
    errors.push(`CSS braces likely unbalanced in assets/style.css ("{"=${open}, "}"=${close})`);
  }
  return errors;
}

function main() {
  const projectRoot = process.cwd();
  const allErrors = [];
  allErrors.push(...checkRequiredFiles(projectRoot));
  allErrors.push(...checkHtmlAssetRefs(projectRoot));
  allErrors.push(...checkJavaScriptSyntax(projectRoot));
  allErrors.push(...checkCssBalance(projectRoot));

  if (allErrors.length === 0) {
    exitWith(0, 'Scan complete: no issues found.');
  } else {
    console.log('Scan complete with issues:');
    for (const e of allErrors) console.log('- ' + e);
    exitWith(1);
  }
}

main();


