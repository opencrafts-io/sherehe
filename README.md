# Sherehe

This is the sherehe backend for academia.

## Table of Contents


- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Scripts](#scripts)



## Overview

This project provides a backend API for Events in academia using Express.js and PostgreSQL.

## Features

- RESTful API with CRUD support
- PostgreSQL for relational data storage
- MVC-style API project structure
- Unit testing
- CORS and dotenv integration

## Tech Stack

- **Runtime:** Node.js.
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Env Handling:** dotenv
- **Others:** CORS

## Setup Instructions

### Prerequisites

- Node.js >= 14.x
- PostgreSQL installed and running

### 1. Clone the Repository

git clone https://github.com/opencrafts-io/sherehe.git 
cd sherehe

### 2. Install Dependencies

npm install

### 3. Configure Environment Variables

Create a .env file in the root and add:

- vist the env documentation at the end

### 4. Create Database

Create your database manually or via CLI:
just remember your password and username then insert the nessary in the .env

createdb sherehe

### 5. run migartions
npx node-pg-migrate up


### 6. Start the Server

npm run dev

### 7. To run tests
npm test (on a different terminal on the same folder)



Scripts

npm run dev      # Start server with nodemon
node index.js        # Start server in production mode

You should see something like this:
- Welcome to Sherehe Backend

(Note) it runs on port 3000



## How to navigate

### 1. index.js
- This is where middleware such as cors are implemented
- This is also where urls first segment are declared

### 2. Route
- This is where subsequent segments of a url are assigned to a controller

### 3. Controller 
- This is where information from the user is recieved and any conditions are set so as to pass clean data to the models
- This is also where responses and their corresponding statuses are return back to the user not forgetting the data returned back to the user
- It goes without saying that this is where each model is given to a particular controller
- Responses must be returned with their correct status

### 4. Model
- This recieves data from the controller and performs either create , update , delete or get values on the table
- The model can only return message whether a values on a table have been changed , deleted or inserted . It should return data only or valid reponse messages


### 5. Migaration file
- This is where tables are given life and structure.
- The name of the file example (1751445846272_create-events-table.js) shows which table is in structured in the file
to create such a table run the command:
- - npx node-pg-migrate create create-(name_of_the_table)_-table

to run migration
- -  npx node-pg-migrate up 
- -  npx node-pg-migrate down (rollback)
 - In some instances you may have to drop the intended tables if rollback does not work

(Note) The database to be used must be postgres

### 6. Coding practices
- This project only uses camel case when naming variable , functions
- The project uses "type": "module" which mainly uses keyword import during importation rather than require which is the default

### 7. Env
- I do realise that I have repeated the credentials in database and migrations just bear with me

- Database
DB_USER= * (Your username)
DB_HOST=db
DB_NAME=sherehe
DB_PASSWORD= * (Your personal postgres database password)
DB_PORT=5432

- Migrations
PGHOST=db
PGUSER=* (Your username)
PGPASSWORD= * (Your personal postgres database password)
PGDATABASE=sherehe
PGPORT=5432

### 8. Test
- This project uses jest for tests
- The tests are in the folder tests where you can see test for every model , controller or even route
- The babel.config.js helps in making sure that jest knows we are using type: module
- This options are provided by jest
- Watch Usage
  - - Press f to run only failed tests.
  - - Press o to only run tests related to changed files.
  - - Press p to filter by a filename regex pattern.
  - - Press t to filter by a test name regex pattern.
  - - Press q to quit watch mode.
  - - Press Enter to trigger a test run.
- Jest is like nodemon it waits for any change of code then runs the tests according to what it has changed
- When you first clone the repo no test will be done since thier is no change of code , so press a to start the tests
- Errors under console.log are fine and intentionally induced and dislpayed 
- To run tests
- - npm test

<!-- Dont forget to follow openCrafts -->

