from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    version = "dd3100"
    return render_template("index.html", version=version)
