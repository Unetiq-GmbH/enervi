#!/bin/bash
(crontab -l 2>/dev/null ; echo "0 * * * * curl -fsS http://127.0.0.1:8080/enervi/check_activity >/dev/null || true") | crontab

service cron start

exec gunicorn app:app
