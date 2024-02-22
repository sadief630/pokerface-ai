# pokerface-ai

An intelligent agent capable of playing Texas Hold'em Poker with you!

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Python:** Make sure you have Python 3.x installed on your machine. You can download it from [python.org](https://www.python.org/downloads/).

- **Virtual Environments:** Familiarize yourself with Python virtual environments. You can find detailed instructions about how I created the Flask application in [this Medium article](https://medium.com/@albertnwachukwu/how-to-create-a-simple-flask-application-9be43f9aadcd).
  
- **Node.js and npm**: Make sure you have Node.js installed. You can download the latest version from [https://nodejs.org/](https://nodejs.org/). Node.js comes with npm (Node Package Manager), which is used for managing project dependencies.

## Getting Started

To run this project, you need to set up a Python virtual environment and install the required dependencies to run the backend.

### Create Virtual Environment

```bash
py -3 -m venv {environment_name}
```

Activate the environment:

```bash
.\\{environment_name}\Scripts\activate
```

### Install Dependencies

Install the project dependencies using the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

The most notable dependency we are using is Flask, which is used to run the server.

### Run the Backend Server

After installing the dependencies, run the server in your local environment:

```bash
flask run
```

### Important Note

To maintain consistency, it's crucial to update the `requirements.txt` file every time you install a new package. You can do this with the following command:

```bash
pip freeze > requirements.txt
```

This ensures that collaborators can create a similar virtual environment with the correct dependencies for the project.

## Frontend

This part of the project handles the user interface for the poker game.

#### Getting Started with Frontend

Follow these steps to set up and run the frontend locally.

1. Navigate to the Frontend Project Directory from the Base Project

   ```bash
   cd pokerface-frontend
   ```

2. Install Dependencies

   ```bash
   npm install
   ```

   This command will download and install the necessary dependencies for the frontend.

3. Start the Development Server

   ```bash
   npm start
   ```

   This command will start the development server and open the application in your default web browser. Now you can begin working on the Pokerface Frontend!

#### Visualization of Poker Game

The Pokerface Frontend will visualize the poker game in the following ways:

- **Interactive Game Interface:** Utilizes React components to create an interactive and responsive user interface for playing poker.

- **Real-time Updates:** Integrates with the backend to receive real-time updates on the game state and player actions.

- **Visual Representation:** Displays visual elements such as cards to enhance the gaming experience.

If you encounter any issues, make sure you have Node.js and npm installed. You can download them from [https://nodejs.org/](https://nodejs.org/).



