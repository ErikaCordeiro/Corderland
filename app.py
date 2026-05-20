import json
from pathlib import Path

from flask import Flask, render_template


app = Flask(__name__)

SITE_DATA_PATH = Path(__file__).parent / "data" / "site.json"


@app.route("/api/site")
def api_site():
    data = json.loads(SITE_DATA_PATH.read_text(encoding="utf-8"))
    return data


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/health")
def health():
    return {"status": "ok", "service": "coderland-site"}


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
