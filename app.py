from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    version = "2a03c94"
    return render_template("index.html", version=version)
