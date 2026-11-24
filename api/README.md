---
title: ShopBot Mobile API
sdk: docker
app_port: 7860
---

# ShopBot Mobile grading API

This Docker Space contains the synthetic demo backend for G36. Set `DATABASE_URL`, `ANTHROPIC_API_KEY`, and `SELLER_TOKEN` as Space secrets. Set `WEB_ORIGIN` and `MODEL_CALL_LIMIT` as variables. Never use real shopper records in this demo.

- `GET /health` returns plain text `ok`.
- `POST /chat` accepts `user_id`, `thread_id`, and `message`; returns `reply`, `tool_calls`, and `tokens`.
