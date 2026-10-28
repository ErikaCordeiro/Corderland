"""Contact delivery: no message persistence or visitor data in logs."""
import hashlib
import os
import re
import secrets
import http.client
import json
import ssl
import time
from collections import OrderedDict
from threading import Lock

from flask import Blueprint, current_app, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

contact = Blueprint("contact", __name__)
_secret = os.environ.get("CONTACT_TOKEN_SECRET") or secrets.token_hex(32)
_signer = URLSafeTimedSerializer(_secret, salt="coderland-contact")
_lock = Lock()
_attempts = OrderedDict()
_used = {}
EMAIL = re.compile(r"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+\Z")


def valid_email(value):
    return isinstance(value, str) and len(value) <= 254 and bool(EMAIL.fullmatch(value))


def same_origin():
    origin = request.headers.get("Origin")
    # Render terminates TLS at its proxy; Flask may see the internal HTTP scheme.
    return not origin or origin in (request.host_url.rstrip("/"), "https://corderland.onrender.com")


def limited():
    # Do not trust arbitrary X-Forwarded-For supplied by visitors.
    key = hashlib.sha256((request.remote_addr or "unknown").encode()).digest()
    now = time.monotonic()
    with _lock:
        for expired in [k for k, (_, start) in _attempts.items() if now - start > 600]:
            del _attempts[expired]
        count, start = _attempts.get(key, (0, now))
        if count >= 5 or (key not in _attempts and len(_attempts) >= 10000):
            return True
        _attempts[key] = (count + 1, start)
    return False


@contact.get("/api/contact/token")
def token():
    if not same_origin():
        return {"error": "Origem inválida."}, 403
    response = jsonify(token=_signer.dumps({"nonce": secrets.token_hex(24), "issued": time.time()}))
    response.headers["Cache-Control"] = "no-store"
    return response


def deliver(values):
    env = current_app.config
    required = ("RESEND_API_KEY", "RESEND_FROM_EMAIL", "CONTACT_TO_EMAIL")
    if not all(env.get(key) for key in required):
        raise RuntimeError("mail configuration missing")
    sender = env["RESEND_FROM_EMAIL"]
    if not valid_email(sender) or not valid_email(env["CONTACT_TO_EMAIL"]):
        raise RuntimeError("mail address configuration invalid")
    if sender.rsplit("@", 1)[1].lower() in ("gmail.com", "resend.dev"):
        raise RuntimeError("a verified owned sending domain is required")
    text = "\n".join([
        "Novo contato pelo site Coderland", "", "Nome: " + values["name"],
        "E-mail: " + values["email"], "Telefone: " + (values["phone"] or "Não informado"),
        "Empresa: " + (values["company"] or "Não informada"),
        "Interesse: " + values["project"], "", "Mensagem:", values["message"],
    ])
    payload = {"from": sender, "to": [env["CONTACT_TO_EMAIL"]],
               "reply_to": values["email"],
               "subject": "Novo contato pelo site Coderland — " + values["name"], "text": text}
    # Fixed HTTPS destination; never follow redirects with credentials or visitor data.
    connection = http.client.HTTPSConnection("api.resend.com", timeout=12, context=ssl.create_default_context())
    try:
        connection.request("POST", "/emails", body=json.dumps(payload).encode("utf-8"),
                           headers={"Authorization": "Bearer " + env["RESEND_API_KEY"],
                                    "Content-Type": "application/json", "User-Agent": "Coderland-Contact/1.0"})
        response = connection.getresponse()
        if not 200 <= response.status < 300:
            raise RuntimeError("mail API rejected request")
        raw = response.read(65537)
        if len(raw) > 65536:
            raise RuntimeError("mail API response too large")
        result = json.loads(raw)
        if not isinstance(result, dict) or result.get("error") or not isinstance(result.get("id"), str) or not result["id"].strip():
            raise RuntimeError("mail API acceptance not confirmed")
    finally:
        connection.close()


@contact.post("/api/contact")
def send():
    if not same_origin() or request.mimetype != "application/json":
        return {"error": "Solicitação inválida."}, 403
    if limited():
        return {"error": "Muitas tentativas. Aguarde alguns minutos."}, 429, {"Retry-After": "600"}
    if request.content_length is None or request.content_length > 20000:
        return {"error": "Mensagem muito longa."}, 413
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {"error": "Dados inválidos."}, 400
    try:
        signed = _signer.loads(request.headers.get("X-Contact-Token", ""), max_age=3600)
        if time.time() - signed["issued"] < 2 or data.get("website"):
            return {"error": "Aguarde um instante e tente novamente."}, 400
    except (BadSignature, SignatureExpired, KeyError, TypeError):
        return {"error": "Sessão expirada. Tente novamente."}, 403
    values = {}
    for key, maximum in {"name": 120, "email": 254, "phone": 40, "company": 160, "project": 100, "message": 3000}.items():
        value = data.get(key, "")
        if not isinstance(value, str) or len(value) > maximum or "\x00" in value or (key != "message" and any(c in value for c in "\r\n")):
            return {"error": "Revise os campos informados."}, 400
        values[key] = value.strip()
    if not all(values[k] for k in ("name", "project", "message")) or not valid_email(values["email"]):
        return {"error": "Preencha nome, e-mail válido, interesse e mensagem."}, 400
    now = time.monotonic()
    with _lock:
        for nonce in [n for n, expiry in _used.items() if expiry < now]:
            del _used[nonce]
        if signed["nonce"] in _used:
            return {"error": "Esta solicitação já foi processada."}, 409
        if len(_used) >= 10000:
            return {"error": "Tente novamente mais tarde."}, 429
        _used[signed["nonce"]] = now + 3600
    try:
        deliver(values)
    except Exception:
        # Exception text from the provider can contain recipient addresses. Never log it.
        current_app.logger.warning("Contact delivery unavailable")
        return {"error": "Não foi possível enviar. Tente novamente."}, 503
    return {"message": "Mensagem enviada com sucesso!"}
