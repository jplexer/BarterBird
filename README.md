# BarterBird

BarterBird is a Discord bot that provides various functionalities (describe what your bot does here).

## Installation

Follow these steps to install and configure BarterBird:

### Preparation

1. Rename `confidentialconfig.json.example` to `confidentialconfig.json`.
2. Open `confidentialconfig.json` and update the following fields:
   - `token`: Your Bot token.
   - `clientId`: Your Bot's Application ID.
   - `guildId`: Your development server's ID.

### Dependencies Installation

Run the following command to install the necessary dependencies:

```bash
npm install
```

### Commands Registration

To register the commands with Discord:

- For public use, run:

```bash
node deploy-prod-commands.js
```

- For development purposes, run:

```bash
node deploy-dev-commands.js
```

**Note:** If you had commands before, please run the following command to remove them:

```bash
node delete-commands.js
```

### Running the Bot

Now, you can run the Bot using the following command:

```bash
npm start
```