from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    version = "d8e8c5e"
    return render_template("index.html", version=version)
