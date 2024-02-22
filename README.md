# pokerface-ai

An intelligent agent capable of playing Texas Hold'em Poker with you!

## Getting Started

To run this project, you need to set up a Python virtual environment and install the required dependencies.

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

### Run the Server

After installing the dependencies, run the server in your local environment:

```bash
flask run
```

## Important Note

To maintain consistency, it's crucial to update the `requirements.txt` file every time you install a new package. You can do this with the following command:

```bash
pip freeze > requirements.txt
```

This ensures that your collaborators can create a similar virtual environment with the correct dependencies for the project.
