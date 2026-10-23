import json
import mimetypes
from pathlib import Path

from flask import Flask, abort, render_template, url_for


# Ensure correct MIME types on Linux containers (Render) for strict browsers.
mimetypes.add_type("application/javascript", ".js", strict=False)
mimetypes.add_type("application/javascript", ".mjs", strict=False)
mimetypes.add_type("application/javascript", ".jsx", strict=False)
mimetypes.add_type("text/css", ".css", strict=False)

app = Flask(__name__, static_folder="static", static_url_path="/static")

SITE_DATA_PATH = Path(__file__).parent / "data" / "site.json"
PROJECT_SLUGS = ("fluxonland", "hey-dev", "lua-active", "fitland")


def load_site():
    return json.loads(SITE_DATA_PATH.read_text(encoding="utf-8"))


def render_site(project_slug=None):
    site = load_site()
    project = site["projects"][PROJECT_SLUGS.index(project_slug)] if project_slug else None
    title = (project["name"] + " | Projetos Coderland") if project else "Coderland | Tecnologia que transforma negócios"
    description = project["description"] if project else site["hero"]["subhead"]
    return render_template("index.html", site=site, project_slug=project_slug,
                           title=title, description=description,
                           canonical="https://corderland.onrender.com" + (
                               url_for("project_page", slug=project_slug) if project_slug else "/"))


@app.route("/api/site")
def api_site():
    return load_site()


@app.route("/")
def home():
    return render_site()


@app.route("/projetos/<slug>")
def project_page(slug):
    if slug not in PROJECT_SLUGS:
        abort(404)
    return render_site(slug)


@app.route("/favicon.ico")
def favicon():
    return app.send_static_file("images/brand/favicon.ico")


@app.route("/health")
def health():
    return {"status": "ok", "service": "coderland-site"}


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
