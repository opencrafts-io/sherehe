# Project Name

A Node.js RESTful API built with Express and PostgreSQL.

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

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Env Handling:** dotenv
- **Others:** CORS, body-parser, morgan

## Setup Instructions

### Prerequisites

- Node.js >= 14.x
- PostgreSQL installed and running

### 1. Clone the Repository

git clone https://github.com/opencrafts-io/sherehe.git 
cd sherehe

2. Install Dependencies

npm install

3. Configure Environment Variables

Create a .env file in the root and add:

PORT=5042
DATABASE_URL=postgres://user:password@localhost:5432/dbname


You can also use individual vars like:

DB_HOST=localhost
DB_PORT=5432
DB_NAME=events
DB_USER=root
DB_PASSWORD=your_password

4. Create Database

Create your database manually or via CLI:

createdb events


5. Start the Server

npm run dev

API Endpoints


Scripts

npm run dev      # Start server with nodemon
node index.js        # Start server in production mode
