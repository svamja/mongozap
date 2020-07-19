# MongoZap

A Faster MongoDB Client (First Release on 15th August 2020)

## Installation


````
git clone https://github.com/svamja/mongozap
cd mongozap
npm install
npm start
````

You can now access it on `http://localhost:3333`

## Server Configuration

It uses .env file and environment variables for configuration. Below variables are used for configuration.

| Variable      | Description           | Default   |
| ----          | -----                 | ----      |
| PORT          | Port to bind to       | 3333      |
| SETTINGS_DB   | database used to save the server side settings    | 'mongozap' |
| SETTINGS_COLL | collection used to save the server side settings  | 'settings' |


Apart from above, the app uses `mongozap.fields` collection by default to save schema information.
This can be updated from within the MongoZap app, under settings section.

