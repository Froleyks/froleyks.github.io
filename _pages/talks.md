---
layout: page
title: talks
permalink: /talks/
nav: true
nav_order: 3
display_categories: [Lectures, Conference Talks]
---

<div class="projects talks">
  {% for category in page.display_categories %}
    <h2 class="category">{{ category }}</h2>
    <div class="row row-cols-1 row-cols-md-2">
      {% assign categorized_talks = site.data.talks | where: "category", category %}
      {% for talk in categorized_talks %}
        {% include talks.liquid %}
      {% endfor %}
    </div>
  {% endfor %}
</div>
