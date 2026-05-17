from fastapi.templating import Jinja2Templates

from app.utils.formatting import format_count, format_views


def create_templates(directory: str = "app/templates") -> Jinja2Templates:
    templates = Jinja2Templates(directory=directory)
    templates.env.globals["format_count"] = format_count
    templates.env.globals["format_views"] = format_views
    return templates
