"""Append-only event ledger with SQLite WAL. Enables full replay.

Every state transition emits an event with monotonically increasing seq.
Reflector jobs read the ledger; nothing else may mutate history.
"""

from __future__ import annotations

import json
import sqlite3
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterator


SCHEMA = """
CREATE TABLE IF NOT EXISTS events (
    seq       INTEGER PRIMARY KEY AUTOINCREMENT,
    ts        REAL NOT NULL,
    kind      TEXT NOT NULL,
    payload   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_events_kind_ts ON events (kind, ts);
"""


class Ledger:
    def __init__(self, path: str | Path):
        self.path = str(path)
        self.conn = sqlite3.connect(self.path, check_same_thread=False)
        self.conn.execute("PRAGMA journal_mode = WAL")
        self.conn.execute("PRAGMA synchronous = NORMAL")
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    def emit(self, kind: str, payload: dict[str, Any]) -> int:
        cur = self.conn.execute(
            "INSERT INTO events (ts, kind, payload) VALUES (?, ?, ?)",
            (time.time(), kind, json.dumps(payload, separators=(",", ":"))),
        )
        self.conn.commit()
        return cur.lastrowid

    def replay(self, since_seq: int = 0, kinds: list[str] | None = None) -> Iterator[dict]:
        q = "SELECT seq, ts, kind, payload FROM events WHERE seq > ?"
        args: list[Any] = [since_seq]
        if kinds:
            q += " AND kind IN (" + ",".join("?" * len(kinds)) + ")"
            args.extend(kinds)
        q += " ORDER BY seq ASC"
        for seq, ts, kind, payload in self.conn.execute(q, args):
            yield {"seq": seq, "ts": ts, "kind": kind, "payload": json.loads(payload)}

    def close(self) -> None:
        self.conn.close()
