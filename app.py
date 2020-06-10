from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    version = "40e20e9"
    return render_template("index.html", version=version)
