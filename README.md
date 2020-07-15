# MongoZap
A Faster MongoDB Client

## Installation

Planned to release on 1st August 2020.

````
git clone https://github.com/svamja/mongozap
cd mongozap
npm install
npm start
````

You can now access it on `http://localhost:3333`

## Server Configuration

It uses .env file and environment variables for configuration. Below variables are used for configuration.

PORT - Port to bind to. (Default: 3333)
SETTINGS_DB - database used to save the server side settings (Default: 'mongozap')
SETTINGS_COLL - collection used to save the server side settings (Default: 'settings')

Apart from above, the app uses `mongozap.fields` collection by default to save schema information.
This can be updated from within the MongoZap app, under settings section.










