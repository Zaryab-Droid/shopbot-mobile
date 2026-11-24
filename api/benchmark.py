import argparse
import json
from pathlib import Path
from time import perf_counter
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from uuid import uuid4


def request(base, path, body=None):
    payload = None if body is None else json.dumps(body).encode()
    started = perf_counter()
    req = Request(base + path, data=payload, headers={"Content-Type": "application/json"})
    with urlopen(req, timeout=30) as response:
        return response.read().decode(), round((perf_counter() - started) * 1000)


def main():
    parser = argparse.ArgumentParser(description="Measure ShopBot API latency and reported token usage.")
    parser.add_argument("base_url")
    parser.add_argument("--live", action="store_true",
                        help="Run ten chat cases, writing demo holds and potentially using Claude credits.")
    args = parser.parse_args()
    base = args.base_url.rstrip("/")
    target = urlparse(base)
    if target.scheme not in ("http", "https") or not target.hostname:
        parser.error("Provide an HTTP(S) API base URL.")
    if target.scheme == "http" and target.hostname not in ("localhost", "127.0.0.1", "::1"):
        parser.error("Use HTTPS for a hosted API.")
    health, elapsed = request(base, "/health")
    if health != "ok":
        raise SystemExit(f"Unexpected /health response: {health!r}")
    print(f"Health: ok ({elapsed} ms)")
    if not args.live:
        print("No chat requests sent. Use --live on a disposable demo environment to benchmark chat.")
        return 0

    cases = json.loads((Path(__file__).resolve().parents[1] / "tests.json").read_text())
    run_id = uuid4().hex
    totals = {"in": 0, "out": 0}
    errors = 0
    for number, case in enumerate(cases, 1):
        body = {**case["input"], "user_id": f'{run_id}-{case["input"]["user_id"]}'}
        try:
            raw, elapsed = request(base, "/chat", body)
            result = json.loads(raw)
            if not (
                isinstance(result, dict) and set(result) == {"reply", "tool_calls", "tokens"}
                and isinstance(result["reply"], str) and isinstance(result["tool_calls"], list)
                and isinstance(result["tokens"], dict) and set(result["tokens"]) == {"in", "out"}
                and all(type(value) is int and value >= 0 for value in result["tokens"].values())
            ):
                raise ValueError("Unexpected /chat response shape")
            for key in totals:
                totals[key] += result["tokens"][key]
            print(json.dumps({"case": number, "expected": case["expected"], "latency_ms": elapsed, **result}))
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            errors += 1
            print(json.dumps({"case": number, "error": str(error)}))
    print(json.dumps({"reported_tokens": totals, "transport_or_contract_errors": errors,
                      "note": "Compare replies to expectations manually; these totals are not billed cost."}))
    return int(errors > 0)


if __name__ == "__main__":
    raise SystemExit(main())
