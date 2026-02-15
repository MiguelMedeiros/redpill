<p align="center">
  <br />
  <img src="assets/banner.jpg" alt="redpill" width="600" />
  <br />
  <br />
  <code>&nbsp;💊 redpill&nbsp;</code>
  <br />
  <br />
  <em>"You take the red pill, I show you how deep the rabbit hole goes."</em>
  <br />
  <sub>— Morpheus</sub>
  <br />
  <br />
  <a href="https://www.npmjs.com/package/redpill-cli"><img src="https://img.shields.io/npm/v/redpill-cli.svg?style=flat-square&color=cc0000" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/redpill-cli"><img src="https://img.shields.io/npm/dm/redpill-cli.svg?style=flat-square&color=cc0000" alt="downloads" /></a>
  <a href="https://github.com/MiguelMedeiros/redpill/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/redpill-cli.svg?style=flat-square&color=cc0000" alt="license" /></a>
</p>

---

> **The Matrix has your ports.** Every developer has seen `EADDRINUSE`. You Google it. You run `lsof`. You copy the PID. You run `kill`. Every. Single. Time.
>
> **Take the red pill.** See the truth. Free your ports. One command.

## Install

```bash
npm i -g redpill-cli
```

Or run directly — no install needed:

```bash
npx redpill-cli 3000
```

## Wake Up, Neo...

### See the truth about a port

```bash
redpill 3000
```

```
  💊 redpill 3000

  PID   2847
  Name  node
  Cmd   next dev
  User  neo

  Kill this process? (y/n)
```

### Free your port — no questions asked

```bash
redpill free 3000
```

> _"There is no spoon."_ There is no port conflict. Just free it.

### Free an entire range

```bash
redpill free 3000-3010
```

> _"I know Kung Fu."_ — You, after freeing 10 ports in one command.

### See all listening ports

```bash
redpill list
# or
redpill ls
```

```
  💊 redpill ls

  PORT    PID       NAME            COMMAND
  ────────────────────────────────────────────────────────────
  3000    2847      node            next dev
  5432    1203      postgres        /usr/lib/postgresql/14/bin/…
  8080    3891      node            vite

  3 ports in use
```

> _"I can only show you the door. You're the one that has to walk through it."_

### Help

```bash
redpill --help
```

## Why?

You've been living in the **blue pill** world:

```
Error: listen EADDRINUSE: address already in use :::3000
```

```bash
# The blue pill way (every single time)
lsof -i :3000
# scroll through output...
kill -9 2847
# pray it worked...
```

**Take the red pill:**

```bash
# The red pill way
redpill 3000
# → node (PID 2847) - next dev
# → Kill? y
# ✓ Done.
```

> _"Welcome to the real world."_

## Platforms

Works on **macOS** and **Linux** (uses `lsof` under the hood).

> _"Unfortunately, no one can be told what the Matrix is. You have to see it for yourself."_
>
> Run `redpill ls` and see.

## License

MIT
