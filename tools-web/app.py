from flask import Flask, abort, render_template, request

app = Flask(__name__)

CATEGORIES = [
    {
        "slug": "social-downloaders",
        "name": "Social downloaders",
        "eyebrow": "Video capture",
        "description": "Clean pages for saving public social videos and media links when the backend is connected.",
        "accent": "amber",
    },
    {
        "slug": "ai-tools",
        "name": "AI tools",
        "eyebrow": "Smart helpers",
        "description": "Writing, summarizing, rewriting, and productivity utilities powered by AI workflows.",
        "accent": "cyan",
    },
    {
        "slug": "utility-tools",
        "name": "Everyday utilities",
        "eyebrow": "Fast tasks",
        "description": "Small browser tools for text, media, files, links, and daily online work.",
        "accent": "lime",
    },
]

TOOLS = [
    {
        "slug": "facebook-downloader",
        "name": "Facebook Downloader",
        "category": "social-downloaders",
        "label": "Popular",
        "description": "Paste a public Facebook video link and prepare it for future download processing.",
        "long_description": "A focused page for public Facebook video links with a polished input flow, safety notes, and space for HD/SD download results when the backend is added.",
        "placeholder": "https://www.facebook.com/watch/?v=...",
        "button": "Analyze Facebook link",
        "status": "Frontend ready",
        "features": ["Public video URL form", "HD and SD result layout ready", "Mobile-first downloader panel"],
    },
    {
        "slug": "social-video-downloader",
        "name": "Social Video Downloader",
        "category": "social-downloaders",
        "label": "Multi-platform",
        "description": "One landing page for public video links from major social platforms.",
        "long_description": "Designed as the universal intake for social video tools, ready to route TikTok, Instagram, X, YouTube Shorts, and more to platform-specific handlers.",
        "placeholder": "Paste a public social video URL...",
        "button": "Scan social link",
        "status": "Routing ready",
        "features": ["Universal link intake", "Platform cards", "Result area for thumbnails and formats"],
    },
    {
        "slug": "ai-tools",
        "name": "AI Tools Hub",
        "category": "ai-tools",
        "label": "New",
        "description": "A launchpad for AI writing, rewriting, summaries, and idea tools.",
        "long_description": "A refined AI hub page that can grow into prompt tools, text rewriting, summarizers, title generators, image prompts, and other assistant workflows.",
        "placeholder": "Describe what you want the AI tool to do...",
        "button": "Preview AI workflow",
        "status": "Coming soon",
        "features": ["AI workflow cards", "Prompt input area", "Expandable tool sections"],
    },
    {
        "slug": "text-tools",
        "name": "Text Tools",
        "category": "utility-tools",
        "label": "Utility",
        "description": "Case converter, word counter, slug generator, and formatter pages for daily work.",
        "long_description": "A future home for lightweight text utilities that should run fast without complicated setup.",
        "placeholder": "Paste text here...",
        "button": "Open text workspace",
        "status": "Planned",
        "features": ["Word and character tools", "Slug and title helpers", "Formatting utilities"],
    },
]

TOOLS_BY_SLUG = {tool["slug"]: tool for tool in TOOLS}
CATEGORIES_BY_SLUG = {category["slug"]: category for category in CATEGORIES}


def category_for(tool):
    return CATEGORIES_BY_SLUG[tool["category"]]


@app.context_processor
def inject_site_data():
    return {
        "categories": CATEGORIES,
        "tools": TOOLS,
        "category_for": category_for,
    }


@app.route("/")
def home():
    featured_tools = TOOLS[:3]
    return render_template("index.html", featured_tools=featured_tools, title="ToolForge — Fast Online Tools")


@app.route("/tools")
def tools_index():
    active_category = request.args.get("category", "all")
    if active_category == "all":
        visible_tools = TOOLS
    else:
        visible_tools = [tool for tool in TOOLS if tool["category"] == active_category]
    return render_template(
        "tools.html",
        active_category=active_category,
        visible_tools=visible_tools,
        title="All Tools — ToolForge",
    )


@app.route("/tools/<slug>", methods=["GET", "POST"])
def tool_detail(slug):
    tool = TOOLS_BY_SLUG.get(slug)
    if tool is None:
        abort(404)

    submitted_url = None
    if request.method == "POST":
        submitted_url = request.form.get("tool_input", "").strip()

    return render_template(
        "tool_detail.html",
        tool=tool,
        tool_category=category_for(tool),
        submitted_url=submitted_url,
        title=f"{tool['name']} — ToolForge",
    )


@app.route("/about")
def about():
    return render_template("about.html", title="About — ToolForge")


@app.route("/contact")
def contact():
    return render_template("contact.html", title="Contact — ToolForge")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
