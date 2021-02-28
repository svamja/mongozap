# MongoZap

MongoDB GUI Client, geared towards faster productivity 

* keyboard shortcuts
* CRUD operations (Cread, Read, Update, Delete)
* generate & view schema
* tabular + json view
* selection of fields
* filtering by fields + raw query
* manage indexes
* aggregation
* export to google sheet
* login using google auth
* assign read-only / admin roles

It is built using SPA (Single Page Application) architecture using VueJS and NodeJS.

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

| Variable      		| Description           				| Default  |
| ----          		| -----                 				| ----     |
| PORT          		| Port to bind to    				  	| 3333     |
| DEFAULT_CONNECTION  	| Default connection to use    			| 'mongodb://127.0.0.1/' |
| MONGOZAP_DATABASE		| Name of mongozap database for schema. 'mongozap' is a small database used to store schema, connections and aggregation queries. This information is stored only in the default connection.  | 'mongozap' |
| MONGOZAP_SECRET       | Secret for encrypting JWT token       |          | 
| ALLOW_DEFAULT_LOGIN   | Allow login using 'admin' / 'admin'   | 'Y'      |
| BASE_URL              | Server on which mongozap is running. Used for Google authentication. Override it to 'http://localhost:8080' when running in development. Change it to suitable hostname when using nginx proxy. | 'http://localhost:3333' |



## Screenshots

![Screenshots](screenshots/index.png)

More screenshots [here](screenshots.md).


## Google Login / Google Connect (for Google Sheets Export)

1. Create OAuth Client Id on [Google Console](https://console.cloud.google.com/apis/credentials)
    Origin: http://localhost:3333
    Redirect URI:
    http://localhost:3333/api/google/auth/login
    http://localhost:3333/api/google/auth/connect
2. Download and save the credentials at the root of the project as ".google_credentials.json"
3. Update .env file to add below variable
    `GOOGLE_CLIENT_ID=your_google_client_id`
4. Restart Mongozap.
5. Go to Settings under Mongozap and click Google Connect link.
6. Or, use 'Google Login' on the login screen.


## Development

Watch files and launch development server & client services

````
bin/start_development.sh
````

You can now access the development server on `http://localhost:8080`

Build

````
cd client
npm run build
````

Stop development services

````
bin/stop_development.sh
````


