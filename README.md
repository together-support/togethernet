# Togethernet

Visit the [project website](https://togethernet-website.herokuapp.com/) for more info.

# Local Development
Prepare your local development environment using the following steps:

### Environment variables
- If you need to set or overwrite any environment variables, they should be declared in a file named `.env` in the root of the togethernet directory.
- Restart your app any time an environment variable is changed

### Set up the postgres database
- Install [Postgress.app](https://postgresapp.com/). Open the application to start your postgres server. 
- [Create a development database](https://www.tutorialspoint.com/postgresql/postgresql_create_database.htm)
- set the `PG_DB` environment variable to the name of the database you just created
- set the `PG_USER` and `PG_PASSWORD` environment variables to the credentials of a user that has access to the database you just created
- set up your database by running the migrations in `src/db`. The files are named for the order the migrations should be run. A file named with incrementing numbers represents a migration you would run to move your database forward. For example, running migration `1-2.sql` should be run first, with your database going from state 1 to state 2. A file named with the numbers in reverse represents a migration to roll back the state of your database. For example, `2-1.sql` would revert the state of your database from state 2 to state 1. 

### Install Dependencies
- Install [Yarn](https://classic.yarnpkg.com/en/docs/install). If you use the homebrew package manager, you can install with `brew install yarn`.
- Run `yarn install` from the root togethernet directory.

### Start the Project
- Start the project with `yarn start`. View the project at http://localhost:3000/. 

