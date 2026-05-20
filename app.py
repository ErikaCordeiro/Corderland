import json
import mimetypes
from pathlib import Path

from flask import Flask, render_template


# Ensure correct MIME types on Linux containers (Render) for strict browsers.
mimetypes.add_type("application/javascript", ".js", strict=False)
mimetypes.add_type("application/javascript", ".mjs", strict=False)
mimetypes.add_type("application/javascript", ".jsx", strict=False)
mimetypes.add_type("text/css", ".css", strict=False)

app = Flask(__name__, static_folder="static", static_url_path="/static")

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
