# MongoZap

MongoDB GUI Client, geared towards faster productivity 

* keyboard shortcuts
* CRUD operations (Cread, Read, Update, Delete)
* generate & view schema
* tabular + json view
* selection of fields
* filtering by fields + raw query
* manage indexes

Single Page Application architecture using VueJS and NodeJS.

## Getting Started


````
git clone https://github.com/svamja/mongozap
cd mongozap
npm install
npm start
````

You can now access it on [http://localhost:3333](http://localhost:3333)

## Server Configuration

It uses .env file and environment variables for configuration. Below variables are used for configuration.

| Variable      		| Description           				| Default   				|
| ----          		| -----                 				| ----      				|
| PORT          		| Port to bind to    				  	| 3333      				|
| DEFAULT_CONNECTION  	| default connection to use    			| 'mongodb://127.0.0.1/' 	|
| MONGOZAP_DATABASE		| name of mongozap database for schema  | 'mongozap' 				|


'mongozap' is a small database used to store schema and additional connections.
this information is stored only in the default connection.


## Screenshots

![Screenshots](screenshots/index.png)

More screenshots [here](screenshots.md).


## Google Connect (for Google Sheets Export)

1. Create OAuth Client Id on [Google Console](https://console.cloud.google.com/apis/credentials)
    Origin: http://localhost:3333
    Redirect URI: http://localhost:3333/api/google/auth/complete
2. Download and save the credentials at the root of the project as ".google_client.json"
3. Update .env file to add below variable
    `GOOGLE_CLIENT_ID=your_google_client_id`
4. Restart Mongozap.
5. Go to Settings under Mongozap and click Google Connect link.


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



