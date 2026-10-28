---
id: github-actions-build-apk
name: Build APK with GitHub Actions
category: coding
pack: dev
type: workflow
description: Mga hakbang para gumawa ng Cordova APK sa GitHub Actions, walang PC.
tags: [github, actions, cordova, apk]
version: 1.0.0
updated: 2026-10-28
related: [termux-pkg-cheatsheet]
---

# Kailangan
- Repo na may `config.xml` at `www/index.html`
- Workflow file sa `.github/workflows/build-apk.yml`

# Mga hakbang
1. I-commit ang workflow. Tatakbo ito sa bawat push sa `main`, o manual sa Actions tab (Run workflow).
2. Ang workflow ay nagse-setup ng Node, JDK 17, at Android SDK.
3. Nag-i-install ng Cordova, nag-a-add ng Android platform, at nagba-build ng debug APK.
4. Buksan ang run sa Actions tab, i-download ang artifact, i-unzip, at i-install ang `app-debug.apk`.
5. Kapag nag-fail, buksan ang failed step, kopyahin ang huling error lines, at ipakita sa AI.

# Pitfalls
- Kailangang payagan ang install from unknown sources sa phone.
- Debug APK lang ito. Para sa Play Store kailangan ng signed release build.
- verify: ang mga version ng Cordova at cordova-android ay maaaring magbago. Kung may bagong error, tingnan muna ang version compatibility.
