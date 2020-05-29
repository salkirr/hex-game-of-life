from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    version = "d52fed1"
    return render_template("index.html", version=version)
