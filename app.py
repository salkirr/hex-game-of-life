from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    version = "ac13fc0"
    return render_template("index.html", version=version)
