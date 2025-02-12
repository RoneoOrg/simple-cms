---
title: Releases
group: Intro
weight: 4
---



## Update the CMS Version

The update procedure for your CMS depends upon the method you used to install Simple CMS.

### Package Manager

If you are using a package manager like Yarn or NPM, use their standard procedure to update. This is how both the Hugo and Gatsby starters are set up.

### CDN

If you are using the CMS through a CDN like Unpkg, then that depends on the version tag you are using. You can find the version tag in the `/admin/index.html` file of your site.

- (Recommended) If you use `^0.1.0`, the CMS does all updates except major versions automatically.
  - It upgrades to `0.1.1`, `0.2.0`, `0.2.1`.
  - It does not upgrade to `1.0.0` or higher.
  - It does not upgrade to beta versions.

- If you use `~0.1.0`, the CMS will do only patch updates automatically.
  - It upgrades `0.1.1`, `0.1.2`.
  - It does not upgrade to `0.2.0` or higher.
  - It does not upgrade beta versions.
