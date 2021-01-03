# MongoZap

A Faster MongoDB Client

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

| Variable      		| Description           				| Default   				|
| ----          		| -----                 				| ----      				|
| PORT          		| Port to bind to    				  	| 3333      				|
| DEFAULT_CONNECTION  	| default connection to use    			| 'mongodb://127.0.0.1/' 	|
| MONGOZAP_DATABASE		| name of mongozap database for schema  | 'mongozap' 				|


'mongozap' is a small database used to store schema and additional connections.
this information is stored only in the default connection.


## Develop

Watch files and run with code changes


````
# server
npm run dev # or, npx nodemon server/index.js

# client
npm run client # or, cd client && npm run serve
````

You can now access the development server on `http://localhost:8080`

Build

````
cd client
npm run build
````



