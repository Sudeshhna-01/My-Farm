# E-commerce Store

A simple e-commerce store built with Node.js that allows users to browse products, add them to cart, and place orders.

## Features

- Product browsing
- Shopping cart functionality
- Checkout process
- Order placement
- Responsive design

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-store
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8000`

## Deployment

### Environment Variables

The following environment variables can be configured:

- `PORT`: The port number the server will run on (default: 8000)
- `HOST`: The host address the server will bind to (default: 0.0.0.0)

### Production Deployment

1. Build the application:
```bash
npm install --production
```

2. Start the server:
```bash
npm start
```

### Deployment Platforms

This application can be deployed to various platforms:

#### Heroku
1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku:
```bash
heroku login
```
3. Create a new Heroku app:
```bash
heroku create your-app-name
```
4. Deploy to Heroku:
```bash
git push heroku main
```

#### DigitalOcean
1. Create a DigitalOcean account
2. Create a new droplet
3. SSH into your droplet
4. Install Node.js and npm
5. Clone your repository
6. Install dependencies and start the server

#### AWS
1. Create an AWS account
2. Launch an EC2 instance
3. Configure security groups
4. SSH into your instance
5. Install Node.js and npm
6. Clone your repository
7. Install dependencies and start the server

## Project Structure

```
├── index.js              # Main application file
├── package.json          # Project dependencies and scripts
├── modules/             # Custom modules
├── templates/           # HTML templates
└── dev-data/           # Product data
```

## License

MIT 