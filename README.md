# konkurs-bot 🎟️

A **production-ready Telegram Contest Bot** built with [Telegraf](https://telegraf.js.org/), [MongoDB](https://www.mongodb.com/), and a clean architecture that separates database, business logic, and Telegram handlers.

---

## Features

- ✅ **Subscription gate** — users must join the channel before participating
- 🎟️ **Unique ticket numbers** — fair pool-based algorithm (never brute-force)
- 🔒 **Duplicate prevention** — one ticket per user, guaranteed unique numbers
- 👑 **Admin commands** — stats, winner selection, CSV export, reset
- 🪵 **Structured logging** — Pino with pretty-print in dev, JSON in production
- 🛡️ **Env validation** — Zod schema fails fast on startup if config is wrong
- 📦 **ES Modules** — modern `import`/`export` syntax throughout

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 LTS |
| MongoDB | ≥ 6 |
| npm | ≥ 9 |

---

## Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd konkurs-bot

# 2. Install dependencies
npm install
```

---

## Configuration

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_TOKEN` | Token from [@BotFather](https://t.me/BotFather) | `7123456789:AAF...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/konkurs-bot` |
| `CHANNEL_ID` | Target channel username or numeric ID | `@mychannel` or `-1001234567890` |
| `ADMIN_IDS` | Comma-separated list of admin Telegram user IDs | `123456789,987654321` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `LOG_LEVEL` | Pino log level (`info`, `debug`, etc.) | `info` |

### Finding your Telegram user ID

Send `/start` to [@userinfobot](https://t.me/userinfobot) on Telegram.

### Finding your channel ID

For public channels use `@channel_username`. For private channels, forward a message to [@userinfobot](https://t.me/userinfobot) to get the numeric ID.

---

## MongoDB Setup

### Local (development)

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or install MongoDB Community Edition
# https://www.mongodb.com/docs/manual/installation/
```

### Cloud (production)

Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier and set `MONGODB_URI` to the Atlas connection string.

---

## Bot Permissions

**The bot must be an Administrator in the target channel.**

Required permissions:
- ✅ Read messages (to call `getChatMember`)

> ⚠️ The bot does **not** read the full subscriber list. It only checks individual users on demand via `getChatMember()`.

---

## Running

### Development mode (with auto-reload)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

---

## User Flow

```
User sends /start
        │
        ▼
Bot checks getChatMember()
        │
   ┌────┴────┐
   │         │
Not         Is
subscribed  subscribed
   │         │
   ▼         ▼
Send        Check MongoDB
"Join       for existing
Channel"    participant
keyboard         │
            ┌───┴───┐
            │       │
          Found   Not found
            │       │
            ▼       ▼
       Return    Pick unused
       existing  ticket from
       ticket    pool [1..500]
                     │
                 ┌───┴───┐
                 │       │
               Empty   Save &
               pool    return
                 │     ticket
                 ▼
           "Contest full"
```

---

## Admin Commands

All admin commands are restricted to the user IDs listed in `ADMIN_IDS`.

| Command | Description |
|---------|-------------|
| `/stats` | Total participants, used & remaining ticket numbers |
| `/winner` | Randomly picks one participant as the winner |
| `/export` | Downloads all participants as a CSV file |
| `/reset` | Deletes all participants (with confirmation keyboard) |

---

## Project Architecture

```
konkurs-bot/
│
├── src/
│   ├── index.js              # Entry point — startup, shutdown
│   │
│   ├── config/
│   │   └── index.js          # Zod-validated env config
│   │
│   ├── database/
│   │   └── connection.js     # MongoDB connect/disconnect lifecycle
│   │
│   ├── models/
│   │   └── participant.model.js  # Mongoose schema & model
│   │
│   ├── services/
│   │   ├── participant.service.js  # All DB/business logic
│   │   └── subscription.service.js # getChatMember wrapper
│   │
│   ├── bot/
│   │   └── index.js          # Bot factory — wires middleware + handlers
│   │
│   ├── commands/
│   │   ├── start.command.js  # /start — subscription check + registration
│   │   ├── stats.command.js  # /stats (admin)
│   │   ├── winner.command.js # /winner (admin)
│   │   ├── export.command.js # /export (admin)
│   │   └── reset.command.js  # /reset (admin)
│   │
│   ├── actions/
│   │   └── index.js          # Inline keyboard callback handlers
│   │
│   ├── middlewares/
│   │   ├── admin.middleware.js   # Blocks non-admins silently
│   │   ├── error.middleware.js   # Global error handler
│   │   └── logging.middleware.js # Logs every update
│   │
│   ├── keyboards/
│   │   └── index.js          # Reusable Markup builders
│   │
│   └── utils/
│       └── logger.js         # Pino logger instance
│
├── .env                      # Your secrets (never commit)
├── .env.example              # Template for onboarding
├── .gitignore
├── package.json
└── README.md
```

### Design Principles

| Layer | Responsibility |
|-------|---------------|
| `config/` | Single source of truth for validated environment |
| `database/` | Connection lifecycle only |
| `models/` | Schema definition only |
| `services/` | All business logic — no Telegram knowledge |
| `commands/` | Thin handlers — call services, format replies |
| `actions/` | Callback query handlers |
| `middlewares/` | Cross-cutting concerns (auth, logging, errors) |
| `keyboards/` | Reusable `Markup` builders |
| `bot/` | Wiring — registers everything on the Telegraf instance |

---

## Ticket Number Algorithm

> The pool-based approach avoids retrying random numbers, making it O(n) with no collision risk.

```
1. Fetch all existing ticketNumbers from MongoDB
2. Build set of used numbers
3. Compute available = [1..500] minus used
4. If available is empty → "Contest is full"
5. Pick Math.random() index from available array
6. Save immediately
```

---

## Security

- Duplicate userId → rejected by MongoDB unique index
- Duplicate ticketNumber → rejected by MongoDB unique index + service-layer guard
- Admin commands → silently ignored for non-admins (no feature disclosure)
- Environment variables → validated at startup, process exits if invalid
- Telegram errors → caught and logged, user receives friendly message

---

## License

MIT
