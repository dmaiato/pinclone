# Pinterest Clone Project

A simple Pinterest-clone web application built with Node.js, Express, and Prisma.

## Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [NPM](https://www.npmjs.com/) (comes with Node.js)

## Getting Started

Follow these steps to get your local development environment running.

### 1. Install Dependencies

Navigate to the project directory and install the required npm packages.

```bash
npm install
```

### 2. Set Up the Database

This project uses Prisma with a SQLite database. The following commands will generate the Prisma Client and create the database schema based on the `prisma/schema.prisma` file.

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Run the Application

Start the development server. You will need to have a start script in your `package.json`, which typically runs your main server file (e.g., `node src/app.js`).

```bash
npm start
```

The application should now be running on `http://localhost:3000` (or whichever port is configured).