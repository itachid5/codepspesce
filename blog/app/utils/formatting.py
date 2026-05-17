def _coerce_count(value: int | str | None) -> int:
    if value is None:
        return 0

    try:
        count = int(str(value).replace(",", "").strip())
    except (TypeError, ValueError):
        return 0

    return max(count, 0)


def format_count(value: int | str | None) -> str:
    value = _coerce_count(value)
    if value < 1000:
        return str(value)

    for number, suffix in ((1_000_000_000, "b"), (1_000_000, "m"), (1_000, "k")):
        if value >= number:
            formatted = (value * 10 // number) / 10
            return f"{formatted:.1f}".rstrip("0").rstrip(".") + suffix

    return str(value)


def format_views(value: int | str | None) -> str:
    count = _coerce_count(value)
    return f"{format_count(count)} {'view' if count == 1 else 'views'}"
