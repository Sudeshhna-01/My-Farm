# Node Farm

A simple Node.js web application that displays information about various farm products.

## Features
- Product overview page
- Individual product pages
- RESTful API endpoint
- Responsive design

## Prerequisites
- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation
1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
npm start
```

The application will be available at `http://localhost:8000`

## API Endpoints
- `/api` - Get all products data in JSON format
- `/` or `/overview` - View all products
- `/product?id=<product-id>` - View individual product details

## Environment Variables
Create a `.env` file in the root directory with the following variables:
```
PORT=8000
NODE_ENV=development
```

## License
MIT 